#!/usr/bin/env node
// @flow
/*::import type {Argv} from 'yargs'*/
import yargs from './cli-yargs';
import runner from './cli-runner';

function run(argvRaw /*:string[]*/, opts /*:CliRunnerOptions*/) {
  const argv /*:Argv*/= yargs(argvRaw);
  runner(argv, opts);
}

module.exports = run;

// I don't know why I'm doing this
if ((require.main /*:any*/) === module) {
  run(process.argv.slice(2), {
    logger: console
  });
}
