import path from 'path';
import yargs from 'yargs';
import minify from '../';

export function earlyExits(argv) {
  if (argv.version) {
    console.log(require('../package.json').version);
    process.exit(0);
  }

  if (argv.h || argv.help) {
    console.log(yargs.usage());
    process.exit(0);
  }
}

export function getFilesAndMinify(argv, opts) {
  argv.results = argv._
    .map(fileOrDir => {
      if (opts.fs.statSync(fileOrDir).isDirectory())
        throw new Error('Directories not supported. Pass a file');
      return fileOrDir;
    })
    .map(file => ({
      contents: String(opts.fs.readFileSync(file)),
      filename: file
    }))
    .map(({contents, filename}) => ({
      contents: minify(contents, argv),
      filename
    }));
}

export function putFiles(argv, opts) {
  argv.results
    .forEach(({contents, filename}) => {
      if (argv._.length === 1) {
        if (argv.output)
          opts.fs.writeFileSync(argv.output, contents);
        else
          console.log(contents);
      } else {
        if (argv.outputDir) {
          const basename = path.basename(filename);
          opts.fs.writeFileSync(path.join(argv.outputDir, basename), result);
        } else {
          throw new Error('output Directory unspecified');
        }
      }
    });
}

export function runTasks(argv, opts) {
  const tasks = [
    earlyExits,
    getFilesAndMinify,
    putFiles
  ];
  tasks.forEach(task => task(argv, opts));
}
