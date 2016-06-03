/**
 * CLI:
 * In progress
 */
/* TODO remove eslint-disable after complete */
/* eslint-disable */

import yargs from 'yargs';
import path from 'path';
import minify from './';

const print = (msg) => console.log('%s', msg);
const print_error = (msg, err) => console.log(msg, err);

const ARGS = yargs
  .usage('$0 input.js [options]')

  .describe('babelrc', '')
  .describe('conditionals', 'Optimizations for if-s and conditional expressions')
  .describe('drop_console', 'Remove calls to console.* functions.')
  .describe('drop_debugger', 'Remove debugger statements.')
  .describe('m', 'Mangle names/pass mangler options.')
  .describe('o', 'Output file (default STDOUT).')
  .describe('V', 'Print version number and exit.')

  .alias('m', 'mangle')
  .alias('o', 'output')
  .alias('V', 'version')

  .string('mangle')

  .boolean('babelrc')
  .boolean('conditionals')
  .boolean('drop_debugger')
  .boolean('V')
  .boolean('version')

  .argv;

if (ARGS.version || ARGS.V) {
  const json = require('../package.json');
  print(json.name + ' ' + json.version);
  process.exit(0);
}

if (ARGS.h || ARGS.help) {
  print(yargs.usage());
  process.exit(0);
}

try {
  minify();
} catch(e) {
  print_error('Error minifying the code' , e);
}
