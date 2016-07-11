// @flow
/*::import type {Argv} from 'yargs'*/
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import minify from '../';

function isExists(file) {
  try {
    fs.statSync(file);
    return true;
  } catch (e) {
    return false;
  }
}

function handleFile(filename /*:string*/, options /*:MinifierOptions*/) /*:CliTaskResult*/ {
  let input = String(fs.readFileSync(filename));
  return {
    contents: minify(input, options),
    filename
  };
}

function putFile(result /*:CliTaskResult*/, argv /*:Argv*/, opts /*CliRunnerOptions*/) {
  if (argv._.length === 1) {
    // then there is only one file
    if (typeof argv.output === 'string') {
      fs.writeFileSync(argv.output, result.contents);
    } else {
      opts.logger.log(result.contents);
    }
  } else {
    const outputDir /*:string*/ = typeof argv.outputDir === 'string' ? argv.outputDir : '';
    if (outputDir) {
      const basename = path.basename(result.filename);
      fs.writeFileSync(path.join(outputDir, basename), result.contents);
    } else {
      opts.logger.error('--outputDir unspecified');
      throw new Error('--outputDir unspecified');
    }
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

function putDir(results /*:CliTaskResult[]*/, argv /*:Argv*/, opts /*:CliRunnerOptions*/) {
  const outputDir /*:string*/ = typeof argv.outputDir === 'string' ? argv.outputDir : '';
  if (outputDir) {
    results.forEach(result => {
      const outfile = path.join(outputDir, result.filename);
      const dirname = path.dirname(outfile);
      mkdirp.sync(dirname);
      fs.writeFileSync(outfile, result.contents);
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
        putDir(results, argv, opts);
      } else {
        let result = handleFile(file, argv);
        putFile(result, argv, opts);
      }
    });
}
