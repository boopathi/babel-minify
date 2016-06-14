(function() {
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  var run = document.getElementById('run');

  var minifier = new Worker('static/worker.js');

  run.addEventListener('click', function(e) {
    e.preventDefault();
    minifier.postMessage({
      input: input.value,
      opts: {}
    });
  });

  minifier.addEventListener('message', function(out) {
    output.value = out.data;
  });
})();
