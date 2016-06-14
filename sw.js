importScripts('build/sw-toolbox.js');

toolbox.cache.name = 'babel-minify-' + 3;

toolbox.precache([
  'static/script.js',
  'static/worker.js',
  'build/babel-minify.js',
  'static/main.css',
  './',
  'https://cdn.jsdelivr.net/normalize/3.0.3/normalize.min.css',
  'https://npmcdn.com/localforage@1.4.2/dist/localforage.min.js'
]);

toolbox.router.get('/', toolbox.fastest);
toolbox.router.get('/*', toolbox.cacheFirst);
toolbox.router.get('/*', toolbox.cacheFirst, { origin: 'cdn.jsdelivr.net' });
toolbox.router.get('/*', toolbox.cacheFirst, { origin: 'npmcdn.com' });
