importScripts('../build/babel-minify.js');

self.addEventListener('message', function(e) {

  if (e.data.start) {
    return self.postMessage({
      ready: true
    });
  }

  var input = e.data.input;
  var opts = e.data.opts;
  try {
    var result = BabelMinify(input, opts);
  } catch (err) {
    console.log(err);
    self.postMessage(err.toString());
  }
  self.postMessage(result);
});
