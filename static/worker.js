importScripts('../build/babel-minify.js');

self.addEventListener('message', function(e) {
  var input = e.data.input;
  var opts = e.data.opts;
  var result = BabelMinify(input, opts);
  self.postMessage(result);
});
