// @flow
import through2 from 'through2';
import babelMinify from 'babel-minify';

export default function GulpBabelMinify(opts /*:MinifierOptions*/) {
  return through2.obj(function(file, enc, callback) {
    const inputCode = file.contents.toString();
    const output = babelMinify(inputCode, opts);

    file.contents = new Buffer(output);
    callback(null, file);
  });
}
