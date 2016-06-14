/* eslint-disable no-console */
import path from 'path';
import fs from 'fs';

import yargs from './yargs';
import {parseArgv} from './parse-argv';
import {runTasks} from './tasks';

/**
 * Runner
 */
function run(argvRaw, opts) {
  const argv = yargs(argvRaw);
  parseArgv(argv, opts);
  runTasks(argv, opts);
}

module.exports = run;

// I don't know why I'm doing this
if (require.main === module) {
  run(process.argv.slice(2), {
    fs,
    logger: console
  });
}
