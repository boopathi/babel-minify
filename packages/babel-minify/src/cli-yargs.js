// @flow
import yargs from 'yargs';
import D from './defaults';
/*::import type {Argv} from 'yargs'*/

function option(arg, name, desc) {
  let type;
  if (Array.isArray(D[name])) {
    type = 'array';
  } else if (typeof D[name] === 'object') {
    return arg;
  } else {
    // This is to satisfy flow
    switch (typeof D[name]) {
      case 'string': type = 'string'; break;
      case 'number': type = 'number'; break;
      case 'boolean': type = 'boolean'; break;
    }
  }

  return arg.option(name, {
    type,
    describe: desc,
    'default': D[name]
  });
}

export default function yargsOptions(_argv /*:string[]*/) /*:Argv*/ {
  const argv = yargs
    .usage('$0 [options] input.js')
    .help('help')
    .alias('help', 'h')
    .version(() => require('../package.json').version)
    .alias('version', 'v')
    .option('output', {
      alias: 'o', type: 'string', nargs: 1,
      describe: 'Output File'
    })
    .option('outputDir', {
      alias: 'd', type: 'string', nargs: 1,
      describe: 'Output Directory'
    });

  option(argv, 'mangle', 'Mangle Identifiers');
  option(argv, 'dead_code', 'Remove Dead Code');
  option(argv, 'conditionals', 'Optimize conditionals statements and expressions');
  option(argv, 'evaluate', 'Constant Folding and Propagation');
  option(argv, 'drop_debugger', 'Remove debugger statements');
  option(argv, 'drop_console', 'Remove console.* statements');
  option(argv, 'properties', 'Fix/Optimize property names');
  option(argv, 'join_vars', 'Join consecutive variable declarations');
  option(argv, 'booleans', 'Optimize booleans');
  option(argv, 'unsafe', 'undefined to void, simplify comparision,  function to arrow');
  option(argv, 'keep_fnames', 'Preserve function names from mangling');
  option(argv, 'passes', 'Number of passes');
  option(argv, 'babelrc', 'Should babelrc be used');
  option(argv, 'presets', 'pass extra presets to babel transformation');
  option(argv, 'plugins', 'pass extra plugins to babel transformation');

  return argv.demand(1).parse(_argv);
}
