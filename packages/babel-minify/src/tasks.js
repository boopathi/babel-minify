// @flow
import fs from 'fs';
import path from 'path';
import minify from '../';

/*::declare type ArgvResults = {
  contents: string,
  filename: string
}*/

export function getFilesAndMinify(argv /*:MinifierArgv*/, opts /*:MinifierCliRunOptions*/) {
  argv.results = argv._
    .map(fileOrDir => {
      if (fs.statSync(fileOrDir).isDirectory()) {
        opts.logger.error('Directories are not supported.');
        throw new Error('Input file is a Directory');
      }
      return fileOrDir;
    })
    .map(file => ({
      contents: String(fs.readFileSync(file)),
      filename: file
    }))
    .map(({contents, filename}) => ({
      contents: minify(contents, argv),
      filename
    }));
}

export function putFiles(argv /*:MinifierArgv*/, opts /*:MinifierCliRunOptions*/) {
  argv.results
    .forEach(({contents, filename}) => {
      if (argv._.length === 1) {
        if (argv.output)
          fs.writeFileSync(argv.output, contents);
        else
          opts.logger.log(contents);
      } else {
        if (argv.outputDir) {
          const basename = path.basename(filename);
          fs.writeFileSync(path.join(argv.outputDir, basename), contents);
        } else {
          opts.logger.error('Output Directory unspecified');
          throw new Error('Output Directory unspecified');
        }
      }
    });
}

export function runTasks(argv /*:MinifierArgv*/, opts /*:MinifierCliRunOptions*/) {
  const tasks = [
    getFilesAndMinify,
    putFiles
  ];
  tasks.forEach(task => task(argv, opts));
}
