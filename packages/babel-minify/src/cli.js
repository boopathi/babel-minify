#!/usr/bin/env node
// @flow

import yargs from './yargs';
import {parseArgv} from './parse-argv';
import {runTasks} from './tasks';

function run(opts /*:MinifierCliRunOptions*/) {
  const argv /*:MinifierArgv*/= yargs();
  parseArgv(argv, opts);
  runTasks(argv, opts);
}

module.exports = run;

/**
 * Flow does not support require.main
 * https://github.com/facebook/flow/issues/1362
 */
if ((require /*:any*/).main === module) {
  // I don't know why I'm doing this
  run({
    logger: console
  });
}
