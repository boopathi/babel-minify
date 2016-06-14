importScripts('build/sw-toolbox.js');

toolbox.cache.name = 'babel-minify-' + 1;

toolbox.precache([
  'static/script.js',
  'static/worker.js',
  'build/babel-minify.js',
  'static/main.css',
  './',
  'https://cdn.jsdelivr.net/normalize/3.0.3/normalize.min.css'
]);

toolbox.router.get('/*', toolbox.cacheFirst);
toolbox.router.get('/*', toolbox.cacheFirst, { origin: 'cdn.jsdelivr.net' });
