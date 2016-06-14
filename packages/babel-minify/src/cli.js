/* eslint-disable no-console */
import yargs from 'yargs';
import path from 'path';
import fs from 'fs';
import minify from '../';

const argv = yargs
  .usage('$0 input.js [options]')

  .help('help')
  .alias('help', 'h')

  .version(() => require('../package.json').version)
  .alias('version', 'v')

  .option('output', {
    alias: 'o',
    type: 'string',
    nargs: 1,
    describe: 'Output File'
  })
  .option('outputDir', {
    alias: 'd',
    type: 'string',
    nargs: 1,
    describe: 'Output Directory'
  })

  .option('mangle', {
    alias: 'm',
    type: 'boolean',
    'default': undefined,
    describe: '[default true] Mangle names'
  })
  .option('dead_code', {
    alias: 'dead-code',
    type: 'boolean',
    'default': undefined,
    describe: '[default false] Remove dead code'
  })
  .option('conditionals', {
    type: 'boolean',
    'default': undefined,
    describe: '[default false] Optimize conditionals statements and expressions'
  })

  .option('global_defs', {
    alias: 'global-defs',
    type: 'array',
    describe: '[default {}] Global Variables'
  })
  .option('evaluate', {
    type: 'boolean',
    'default': undefined,
    describe: '[default true] - Attempt evaluating constant expressions'
  })
  .option('drop_debugger', {
    alias: 'drop-debugger',
    type: 'boolean',
    'default': undefined,
    describe: '[default true] Remove debugger statements'
  })
  .option('drop_console', {
    alias: 'drop-console',
    type: 'boolean',
    'default': undefined,
    describe: '[default true] Remove console.* statements'
  })
  .option('properties', {
    type: 'boolean',
    'default': undefined,
    describe: '[default true] Fix/Optimize property names'
  })
  .option('join_vars', {
    alias: 'join-vars',
    type: 'boolean',
    'default': undefined,
    describe: '[default true] Join consecutive variable declarations'
  })
  .option('booleans', {
    type: 'boolean',
    'default': undefined,
    describe: '[default true] Optimize booleans'
  })
  .option('unsafe', {
    type: 'boolean',
    'default': undefined,
    describe: '[default false] undefined to void, simplify comparison operators'
  })
  .option('keep_fnames', {
    alias: 'keep-fnames',
    type: 'boolean',
    'default': undefined,
    describe: '[default true] preserve function names prevent mangling function names'
  })

  .option('babelrc', {
    type: 'boolean',
    'default': undefined,
    describe: '[default false] '
  })
  .option('plugins', {
    type: 'array',
    describe: '[default true]'
  })
  .option('minify', {
    type: 'boolean',
    'default': undefined,
    describe: '[default true]'
  })

  .demand(1)
  .argv;

const parses = [];

parses.push(function removeUndefinedOptions(opts) {
  for (let key of Object.keys(opts)) {
    if (typeof opts[key] === 'undefined')
      delete opts[key];
  }
});

parses.push(function parseGlobalDefs(opts) {
  if (opts.global_defs) {
    opts.global_defs = opts.globalDefs = opts['global-defs'] = opts.global_defs
      .map(def => def.split('='))
      .reduce((p,c) => {
        p[c[0]] = c[1];
        return p;
      }, {});
  }
});

parses.push(function getFiles(opts) {
  opts.results = opts._
    .map(fileOrDir => {
      if (fs.statSync(fileOrDir).isDirectory())
        throw new Error('Directories not supported. Pass a file');
      return fileOrDir;
    })
    .map(file => [String(fs.readFileSync(file)), file])
    .map(([contents, file]) => [minify(contents, opts), file]);
});

function parseArgv() {
  parses.forEach(parse => parse(argv));
}

function run() {
  if (argv.version) {
    console.log(require('../package.json').version);
    process.exit(0);
  }

  if (argv.h || argv.help) {
    console.log(yargs.usage());
    process.exit(0);
  }

  argv.results
    .forEach(([result, file]) => {
      if (argv._.length === 1) {
        if (argv.output)
          fs.writeFileSync(argv.output, result);
        else
          console.log(result);
      } else {
        if (argv.outputDir) {
          const filename = path.basename(file);
          fs.writeFileSync(path.join(argv.outputDir, filename), result);
        } else {
          throw new Error('output Directory unspecified');
        }
      }
    });
}

/**
 * Runner
 */
parseArgv();

if (require.main === module) {
  run();
} else {
  // I don't know why yet. Just for the sake of it
  module.exports = argv;
}
