(function() {
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  var run = document.getElementById('run');
  var purge = document.getElementById('purge');
  var toolbox = document.querySelector('.tools');
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
    keep_fnames: false,
    npasses: 1,
  };

  /**
   * More than a state
   * State and its modifiers
   */
  var state = {
    running: false,
    readyText: run.innerHTML,
    loadingText: 'loading ...',
    replaceTimeout: null,
    enableRun: function() {
      this.running = false;
      clearTimeout(this.replaceTimeout);
      run.innerHTML = this.readyText;
      run.disabled = false;
    },
    disableRun: function() {
      this.running = true;
      var loadingText = this.loadingText;
      this.replaceTimeout = setTimeout(function () {
        run.innerHTML = loadingText;
      }, 80);
      run.disabled = true;
    },
    run: function () {
      if (!this.running) {
        this.disableRun();
        editor.focus();
        minifier.postMessage({
          input: editor.getValue(),
          opts: minifierOpts
        });
      } else {
        console.log('already running');
      }
    }
  };

  state.disableRun();
  createOptionsBoxes().then(function () {
    // kick start
    // final steps
    minifier.postMessage({ start: true });
  });

  document.body.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 13) {
      e.preventDefault();
      e.stopPropagation();
      state.run();
    }
  });

  editor.on('input', function() {
    localforage.setItem(cachename, editor.getValue());
  });

  localforage.getItem(cachename).then(value => {
    if (value) editor.setValue(value, -1);
    editor.focus();
  });

  run.addEventListener('click', function(e) {
    e.preventDefault();
    state.run();
  });

  minifier.addEventListener('message', function(out) {
    state.enableRun();
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
  function createNumbersBox() {
    var box = document.createElement('select');
    for (var i=0; i<4; i++) {
      var opt = document.createElement('option');
      opt.value = i + 1;
      opt.innerText = i + 1;
      box.appendChild(opt);
    }
    return box;
  }
  function createOptionBox(option) {
    var box, property;
    switch (typeof minifierOpts[option]) {
      case 'boolean':
      box = document.createElement('input');
      property = 'checked';
      box.type = 'checkbox';
      break;

      case 'number':
      box = createNumbersBox();
      property = 'value';
      break;
    }

    box[property] = minifierOpts[option];
    box.addEventListener('change', function(e) {
      minifierOpts[option] = this[property];
      editor.focus();
    });

    var label = document.createElement('label');
    label.appendChild(box);
    label.appendChild(document.createTextNode(' ' + option));

    var div = document.createElement('div');
    div.className = 'tool option';
    div.appendChild(label);

    return div;
  }

  /**
   * Just some weird experiment.
   * Why not?
   */
  function createOptionsBoxes() {
    var promises = Object.keys(minifierOpts)
      .map(function(option) {
        return createOptionBox(option);
      })
      .map(function(div) {
        return new Promise(function (resolve) {
          requestAnimationFrame(function () {
            toolbox.appendChild(div);
            resolve();
          });
        });
      });
    return Promise.all(promises);
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
