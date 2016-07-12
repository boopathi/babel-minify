import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import cli from '../src/cli';

function clean() {
  rimraf.sync(path.join(__dirname, 'resources', 'lib'));
}

clean();

const event = {
  callbacks: [],
  trigger(type, ...result) {
    this.callbacks.forEach(fn => fn(type, ...result));
  },
  subscribe(fn) {
    this.callbacks.push(fn);
  },
  clear() {
    this.callbacks = [];
  }
};

const logger = {
  log(...args) { event.trigger('log', ...args) },
  warn(...args) { event.trigger('warn', ...args) },
  error(...args) { event.trigger('error', ...args) }
};

describe('babel-minify-cli', function () {
  it('should throw when no file is passed', function () {
    expect(
      () => { cli(['notfound']) }
    ).toThrow();
  });

  beforeEach(function () {
    event.clear();
    mkdirp.sync('packages/babel-minify/test/resources/lib');
  });

  afterEach(function () {
    clean();
  });

  it('should change file and display output', function () {
    event.subscribe((type, output) => {
      expect(type).toEqual('log');
      expect(
        trim(output)
      ).toEqual(
        trim('(()=>{let a = 1, b = 2; window.baz = 3})()')
      )
    });
    cli(['packages/babel-minify/test/resources/src/bar.js'], { logger });
  });

  it('should work for a single file with output dir', function () {
    event.subscribe(type => {
      expect(type).toEqual('log');
      const outfile = path.join(__dirname, 'resources', 'lib', 'bar.js');
      expect(() => fs.statSync(outfile)).toNotThrow();
      expect(fs.statSync(outfile).isFile()).toEqual(true);
    });

    cli([
      '--outputDir',
      'packages/babel-minify/test/resources/lib',
      'packages/babel-minify/test/resources/src/bar.js'
    ], { logger });
  });

  it('should work for a single file with output file specified', function () {
    event.subscribe(type => {
      expect(type).toEqual('log');
      const outfile = path.join(__dirname, 'resources', 'lib', 'barbar.js');
      expect(() => fs.statSync(outfile)).toNotThrow();
      expect(fs.statSync(outfile).isFile()).toEqual(true);
    });

    cli([
      '--output',
      'packages/babel-minify/test/resources/lib/barbar.js',
      'packages/babel-minify/test/resources/src/bar.js'
    ], { logger });
  });

  it('should throw when input is dir and outputDir is null', function () {
    event.subscribe(type => {
      expect(type).toEqual('error');
    });

    expect(
      () => cli([
        'packages/babel-minify/test/resources/src'
      ], { logger })
    ).toThrow();
  });

  it('should work for input dir and output dir', function () {
    cli([
      '--output-dir',
      'packages/babel-minify/test/resources/lib',
      'packages/babel-minify/test/resources/src'
    ]);

    ['foo/a.js', 'foo/b.js', 'foo/c.js', 'bar.js', 'baz.js']
      .map(p => path.join('packages/babel-minify/test/resources/lib', p))
      .forEach(p => {
        fs.statSync(p);
        expect(() => fs.statSync(p)).toNotThrow();
      });
  });
});
