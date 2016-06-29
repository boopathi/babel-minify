(function() {
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  var run = document.getElementById('run');
  var purge = document.getElementById('purge');
  var toolbox = document.querySelector('.toolbox');
  var minifier = new Worker('static/worker.js');
  var cachename = 'babel-minify-1';

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
  var loadingText = "<small>loading</small> ...";

  // initializing sequence;
  localforage.config({
    driver: [localforage.WEBSQL,
             localforage.INDEXEDDB,
             localforage.LOCALSTORAGE],
  });
  disableRun();
  loadFromCache(0).then(function(contents) {
    input.value = contents;
    cache();
  });
  createOptionsBoxes();

  /**
   * Functions
   */
  function createOptionBox(option) {

    var box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = minifierOpts[option];
    box.addEventListener('change', function(e) {
      minifierOpts[option] = this.checked;
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

  function enableRun() {
    run.innerHTML = readyText;
    run.disabled = false;
  }
  function disableRun() {
    run.innerHTML = loadingText;
    run.disabled = true;
  }

  function loadFromCache(retries) {
    return localforage.getItem(cachename)
      .then(function(item) {
        if (!item) {
          if (retries > 3)
            return localforage.setItem(cachename, "(function() {\n  'use strict';\n\n  const hello = 'world';\n\n  function foo({\n    vec2 = {\n      x2 = 0,\n      y2 = 0\n    } = {},\n    vec3 = {\n      x3 = 0,\n      y3 = 0,\n      z3 = 0\n    } = {}\n  } = {}) {\n\n    return Math.sqrt(x2 * x2 + y2 * y2)\n      + 365 * 24 * 60 * 60 * 1000\n      + Math.sqrt(x3 * x3 + y3 * y3 + z3 * z3);\n\n  }\n})();\n");
          return loadFromCache(retries + 1);
        }
        return item;
      });
  }
  function delay(timeout) {
    return new Promise(function(resolve) {
      setTimeout(resolve, timeout);
    });
  }
  function cache(content) {
    return delay(1000)
      .then(function() {
        return localforage.setItem(cachename, content);
      })
      .then(function() {
        cache(input.value);
      });
  }

  function removeCaches() {
    let p = [localforage.removeItem(cachename)];
    if (caches) {
      p.push(caches.keys().then(function(keylist) {
        return Promise.all(keylist.map(function(key) {
          return caches.delete(key);
        }));
      }));
    }
    return Promise.all(p);
  }

  run.addEventListener('click', function(e) {
    e.preventDefault();
    minifier.postMessage({
      input: input.value,
      opts: minifierOpts
    });
  });

  minifier.addEventListener('message', function(out) {
    if (out.data.ready) return enableRun();
    output.value = out.data;
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
        console.log('updating sw');
        reg.update().then(function() {
          console.log('updating sw [done]');
        });
      });
    });
  }
})();
