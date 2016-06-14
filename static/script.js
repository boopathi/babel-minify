(function() {
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  var run = document.getElementById('run');

  var readyText = run.innerHTML;
  var loadingText = "<small>loading</small> ...";

  function enableRun() {
    run.innerHTML = readyText;
    run.disabled = false;
  }
  function disableRun() {
    run.innerHTML = loadingText;
    run.disabled = true;
  }

  var minifier = new Worker('static/worker.js');

  disableRun();

  run.addEventListener('click', function(e) {
    e.preventDefault();
    minifier.postMessage({
      input: input.value,
      opts: {}
    });
  });

  minifier.addEventListener('message', function(out) {
    if (out.data.ready) return enableRun();
    output.value = out.data;
  });


  // kick start
  minifier.postMessage({ start: true });
})();

// service worker
(function() {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('sw.js');
  }
})();
