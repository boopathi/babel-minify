(function() {
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  var run = document.getElementById('run');
  var purge = document.getElementById('purge');
  var toolbox = document.querySelector('.toolbox');
  var minifier = new Worker('static/worker.js');
  var cachename = 'babel-minify-1';

  // enable editor
  ace.config.set('modePath', 'https://cdn.jsdelivr.net/ace/1.2.3/min/');
  ace.config.set('workerPath', 'https://cdn.jsdelivr.net/ace/1.2.3/min/');
  ace.config.set('themePath', 'https://cdn.jsdelivr.net/ace/1.2.3/min/');
  var editor = ace.edit('input');
  // editor.$blockScrolling = Infinity;
  editor.getSession().setMode('ace/mode/javascript');
  editor.getSession().setOptions({ tabSize: 2, useSoftTabs: true });

  var minifierOpts = {
    mangle: true,
    mangle_globals: false,
    dead_code: false,
    conditionals: true,
    evaluate: true,
    drop_debugger: false,
    drop_console: false,
    properties: true,
    join_vars: true,
    booleans: true,
    unsafe: true,
    keep_fnames: false
  };

  var readyText = run.innerHTML;
  var loadingText = "loading ...";

  disableRun();
  createOptionsBoxes();

  editor.on('input', function() {
    localforage.setItem(cachename, editor.getValue());
  });

  localforage.getItem(cachename).then(value => {
    if (value) editor.setValue(value, -1);
    editor.focus();
  });

  run.addEventListener('click', function(e) {
    e.preventDefault();
    disableRun();
    editor.focus();
    minifier.postMessage({
      input: editor.getValue(),
      opts: minifierOpts
    });
  });

  minifier.addEventListener('message', function(out) {
    enableRun();
    if (typeof out.data === 'string') {
      output.value = out.data;
    }
  });

  purge.addEventListener('click', function(e) {
    console.log('removing all caches');
    removeCaches().then(function() {
      console.log('removing all caches [done]');
    });
  });

  // kick start
  // final steps
  minifier.postMessage({ start: true });

  // service worker
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('sw.js').then(function(reg) {
      purge.addEventListener('click', function(e) {
        console.log('removing sw');
        reg.unregister().then(function() {
          console.log('removing sw [done]');
        });
      });
    });
  }

  /**
   * Functions
   */
  function createOptionBox(option) {
    var box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = minifierOpts[option];
    box.addEventListener('change', function(e) {
      minifierOpts[option] = this.checked;
      editor.focus();
    });

    var label = document.createElement('label');
    label.appendChild(box);
    label.appendChild(document.createTextNode(' ' + option));

    var div = document.createElement('div');
    div.className = 'tool option';
    div.appendChild(label);

    toolbox.appendChild(div);
  }

  function createOptionsBoxes() {
    Object.keys(minifierOpts).forEach(function(option) {
      createOptionBox(option);
    });
  }

  var runTimeout;

  function enableRun() {
    clearTimeout(runTimeout);
    run.innerHTML = readyText;
    run.disabled = false;
  }
  function disableRun() {
    runTimeout = setTimeout(function() {
      run.innerHTML = loadingText;
    }, 80);
    run.disabled = true;
  }

  function removeCaches() {
    let p = [localforage.clear()];
    if (caches) {
      p.push(caches.keys().then(function(keylist) {
        return Promise.all(keylist.map(function(key) {
          return caches.delete(key);
        }));
      }));
    }
    return Promise.all(p);
  }

})();
