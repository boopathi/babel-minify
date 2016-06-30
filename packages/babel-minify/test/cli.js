import path from 'path';
import {spawnSync} from 'child_process';

const minify = path.join(__dirname, '..', 'lib', 'cli.js');

function exec(...args) {
  const p = spawnSync(process.execPath, [minify, ...args]);
  if (p.status !== 0) {
    if (p.error) throw p.error;
    else throw new Error(p.stdout.toString());
  }
  return String(p.output);
}

describe('babel-minify-cli', function() {
  it('should throw when no file is passed', function() {
    expect(() => exec()).toThrow();
  });
  it('should throw when there is no file', function() {
    expect(() => exec('non_existant_file'+Math.random())).toThrow();
  });
  // TODO
});
