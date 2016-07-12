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

// Just so I can test simply by importing it
// and not having to mess around child_process
// which also turns out to be really slow for tests
if ((require.main /*:any*/) === module) {
  run(process.argv.slice(2), {
    logger: console
  });
}
