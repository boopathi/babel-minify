#!/usr/bin/env node
import yargs from './yargs';
import {parseArgv} from './parse-argv';
import {runTasks} from './tasks';

function run(argvRaw, opts) {
  const argv = yargs(argvRaw);
  parseArgv(argv, opts);
  runTasks(argv, opts);
}

module.exports = run;

// I don't know why I'm doing this
if (require.main === module) {
  run(process.argv.slice(2), {
    logger: console
  });
}
