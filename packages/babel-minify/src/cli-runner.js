// @flow
/*::import type {Argv} from 'yargs'*/
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import minify from './';

function handleFile(filename /*:string*/, options /*:MinifierOptions*/) /*:CliTaskResult*/ {
  const input = String(fs.readFileSync(filename));
  const contents = minify(input, options).toString();
  return { contents, filename };
}

function putFile(
  result /*:CliTaskResult*/,
  argv /*:Argv*/,
  opts /*:CliRunnerOptions*/
  /*inputFile /*:string*/
) {
  if (typeof argv.output === 'string') {
    if (argv._.length === 1) {
      fs.writeFileSync(argv.output, result.contents, 'utf-8');
    } else {
      opts.logger.error('--outputDir unspecified');
      throw new Error('--outputDir unspecified');
    }
  } else if (typeof argv.outputDir === 'string') {
    const {outputDir} = argv;
    const basename = path.basename(result.filename);
    fs.writeFileSync(path.join(outputDir, basename), result.contents, 'utf-8');
  } else {
    opts.logger.log(result.contents);
  }
}

function walk(dir /*:string*/) /*:string[]*/ {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(_file => {
    const file = path.join(dir, _file);
    if (fs.statSync(file).isDirectory())
      results = results.concat(walk(file));
    else
      results.push(file);
  });
  return results;
}

function handleDir(dir /*:string*/, options /*:MinifierOptions*/) /*:CliTaskResult[]*/ {
  let files = walk(dir);
  return files.map(filename => handleFile(filename, options));
}

function putDir(
  results /*:CliTaskResult[]*/,
  argv /*:Argv*/,
  opts /*:CliRunnerOptions*/,
  inputDir /*:string*/
) {
  const outputDir /*:string*/ = typeof argv.outputDir === 'string' ? argv.outputDir : '';
  if (outputDir) {
    results.forEach(result => {
      const inputfile = path.resolve(path.join('./', result.filename));
      const inputDirAbs = path.resolve(path.join('./', inputDir));
      const relativePath = inputfile.replace(inputDirAbs, '');

      const outfile = path.join(outputDir, relativePath);
      const dirname = path.dirname(outfile);

      mkdirp.sync(dirname);
      fs.writeFileSync(outfile, result.contents, 'utf-8');
    });
  } else {
    opts.logger.error('--outputDir unspecified');
    throw new Error('--outputDir unspecified');
  }
}

export default function minifyAndOutput(argv /*:Argv*/, opts /*:CliRunnerOptions*/) {
  argv._
    .forEach(file => {
      if (fs.statSync(file).isDirectory()) {
        let results = handleDir(file, argv);
        putDir(results, argv, opts, file);
      } else {
        let result = handleFile(file, argv);
        putFile(result, argv, opts, file);
      }
    });
}
