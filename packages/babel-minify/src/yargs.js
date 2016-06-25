export default function yargsOptions(argv) {
  return require('yargs')(argv)
    .usage('$0 [options] input.js')

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
    .option('presets', {
      type: 'array',
      describe: '[default []] pass presets to babel transformation'
    })
    .option('plugins', {
      type: 'array',
      describe: '[default []] pass plugins to babel transformation'
    })
    .option('minify', {
      type: 'boolean',
      'default': undefined,
      describe: '[default true]'
    })

    .demand(1)
    .argv
}
