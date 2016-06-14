/* eslint-disable no-console */
import path from 'path';
import fs from 'fs';

import {getArgv} from './yargs';
import {parseArgv} from './parse-argv';
import {runTasks} from './tasks';

/**
 * Runner
 */
function run(argvRaw, opts) {
  const argv = getArgv(argvRaw);
  parseArgv(argv, opts);
  runTasks(argv, opts);
}

module.exports = run;

if (require.main === module) {
  run(process.argv.slice(2), { fs });
}
