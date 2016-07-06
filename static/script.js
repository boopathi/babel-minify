function debounce(func, wait, immediate) {
  "use strict";
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

(function() {
  "use strict";
  var stack = [];
  var events = {};
  var sendQueue = [];

  var sendMetrics = debounce(function() {
    var metric;
    while (metric = stack.pop()) {
      ga('send', 'timing', 'Performance', metric.name, Math.ceil(metric.time));
    }
  }, 1000);

  window.push = function (name) {
    if (console.time && window.TRACE) {
      console.time(name);
    }
    if (window.performance && window.performance.now) {
      startEvent(name, performance.now());
    }
  };
  window.pop = function (name) {
    if (console.time && window.TRACE) {
      console.timeEnd(name);
    }
    if (window.performance && window.performance.now) {
      stopEvent(name, performance.now());
    }
  };

  function startEvent(name, startTime) {
    if (!events.hasOwnProperty(name)) {
      events[name] = [];
    }
    events[name].push(startTime);
  }
  function stopEvent(name, endTime) {
    if (events.hasOwnProperty(name) && events[name].length > 0) {
      var startTime = events[name].shift();
      stack.push({
        name: name,
        time: (endTime - startTime).toFixed(4)
      });
      sendMetrics();
    }
  }
})();

(function() {
  "use strict";
  window.TRACE = false;
  push('main');
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  var run = document.getElementById('run');
  var purge = document.getElementById('purge');
  var toolbox = document.querySelector('.tools');
  var githubStar = document.querySelector('.github-star');
  push('minifier-worker-load');
  var minifier = new Worker('static/worker.js');
  var cachename = 'babel-minify-1';
  var listeners = []; // event listener attachers

  // ace boot up
  push('ace-boot');
  ace.config.set('modePath', 'https://cdn.jsdelivr.net/ace/1.2.3/min/');
  ace.config.set('workerPath', 'https://cdn.jsdelivr.net/ace/1.2.3/min/');
  ace.config.set('themePath', 'https://cdn.jsdelivr.net/ace/1.2.3/min/');
  var editor = ace.edit('input');
  editor.getSession().setMode('ace/mode/javascript');
  editor.getSession().setOptions({ tabSize: 2, useSoftTabs: true });
  pop('ace-boot');

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
    readyText: '🎁 Minify <div class="keyboard-shortcut">(Ctrl + ⏎)</div>',
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
        push('minify-run');
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

  // Boot up
  Promise.resolve()
    .then(function () { push('create-options') })
    .then(createOptionsBoxes)
    .then(function () { pop('create-options') })
    .then(queueUpMinifierLoad)
    .then(function () { push('attach-listeners') })
    .then(attachListeners)
    .then(function () { pop('attach-listeners'); push('populate-editor-from-cache') })
    .then(populateEditor)
    .then(function () { pop('populate-editor-from-cache'); push('github-star-button') })
    .then(enableGithubStarButton)
    .then(function () { pop('github-star-button') })
    .catch(function (err) {
      throw err;
    });

  function queueUpMinifierLoad() {
    minifier.postMessage({ start: true });
  }

  function enableGithubStarButton() {
    return new Promise(function (resolve) {
      requestAnimationFrame(function () {
        var doc = githubStar.contentWindow.document;
        window.d = doc;
        var src = "https://ghbtns.com/github-btn.html?user=boopathi&repo=babel-minify&type=star&count=true&size=large";
        doc.open().write(
          '<body onload="' +
          'window.location.href = \'' + encodeURI(src) + '\'' +
          // 'var d = document;d.getElementsByTagName(\'head\')[0]' +
          // '.appendChild(d.createElement(\'script\')).src = \'' + encodeURI(src) + '\'' +
          '">'
        );
        doc.close();
      });
    });
  }

  function populateEditor() {
    return localforage.getItem(cachename).then(value => {
      if (value) editor.setValue(value, -1);
      editor.focus();
    });
  }

  function attachListeners() {
    listeners.map(function (listener) {
      listener();
    });
  }

  listeners.push(function () {
    document.body.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        ga('send', 'event', {
          eventCategory: 'Run',
          eventAction: 'Ctrl-Enter'
        });
        state.run();
      }
    });
  });

  listeners.push(function () {
    editor.on('input', function() {
      localforage.setItem(cachename, editor.getValue());
    });
  });

  listeners.push(function () {
    run.addEventListener('click', function(e) {
      e.preventDefault();
      ga('send', 'event', {
        eventCategory: 'Run',
        eventAction: 'Minify-Button'
      });
      state.run();
    });
  });

  listeners.push(function () {
    minifier.addEventListener('message', function(out) {
      if (typeof out.data === 'object' && out.data.ready) {
        pop('minifier-worker-load');
      } else {
        pop('minify-run');
      }
      state.enableRun();
      if (typeof out.data === 'string') {
        var percentage = 100 * (1 - out.data.length / editor.getValue().length);
        ga('send', 'event', {
          eventCategory: 'Run',
          eventAction: 'Compression-Percentage',
          eventValue: Math.ceil(percentage)
        });
        console.log('Compression percentage = ', percentage);
        output.value = out.data;
      }
    });
  });

  listeners.push(function () {
    purge.addEventListener('click', function(e) {
      console.log('removing all caches');
      removeCaches().then(function() {
        console.log('removing all caches [done]');
      });
    });
  });

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
    Object.keys(minifierOpts)
      .map(function(option) {
        toolbox.appendChild(createOptionBox(option));
      })
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

  pop('main');
})();
