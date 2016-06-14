importScripts('../build/babel-minify.js');

self.addEventListener('message', function(e) {

  if (e.data.start) {
    return self.postMessage({
      ready: true
    });
  }

  var input = e.data.input;
  var opts = e.data.opts;
  var result = BabelMinify(input, opts);
  self.postMessage(result);
});
