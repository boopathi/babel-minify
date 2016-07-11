# babel-minify

Some tools, babel plugins and presets to minify ES6+ code or whatever code babel understands.

[![Build Status](https://travis-ci.org/boopathi/babel-minify.svg?branch=master)](https://travis-ci.org/boopathi/babel-minify)

## Try Online

https://boopathi.in/babel-minify/

# :rotating_light: WARNING: EXPERIMENTAL

## Track

+ [x] [mangle](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-mangle)
+ [x] [mangle-options] - Pass in a boolean to enable(defaults)/disable or pass in an object with these options
  + `keep_fnames`: [Default: false] Don't mangle function names for FunctionExpressions and FunctionDeclarations - Useful for code depending on `fn.name`. Note - This overrides keep_fnames in the global options (look below)
  + `topLevel`: [Default: false] Mangle variables in the outermost scope
  + `eval`: [Default: false] Don't deopt from mangling when eval is found in the subtree
  + `except`: [Default: []] Pass in an array of strings or functions or RegExps to match against the variable name that is mangled. If there is a match, then that variable name will NOT be mangled.
+ [x] [dead_code](https://www.npmjs.com/package/babel-plugin-transform-dead-code-elimination)
+ [x] [conditionals](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-conditionals)
+ [x] [global_defs](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-global-defs)
+ [x] [evaluate](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-evaluate)
+ [x] [drop_debugger](https://www.npmjs.com/package/babel-plugin-transform-remove-debugger)
+ [x] [drop_console](https://www.npmjs.com/package/babel-plugin-transform-remove-console)
+ [x] properties - [member-expression-literals](https://www.npmjs.com/package/babel-plugin-transform-member-expression-literals), [property-literals](https://www.npmjs.com/package/babel-plugin-transform-property-literals)
+ [x] [join_vars](https://www.npmjs.com/package/babel-plugin-transform-merge-sibling-variables)
+ [x] booleans - [minify booleans](https://www.npmjs.com/package/babel-plugin-transform-minify-booleans)
+ [ ] unsafe - [undefined-to-void](https://www.npmjs.com/package/babel-plugin-transform-undefined-to-void), [simplify-comparison-operators](https://www.npmjs.com/package/babel-plugin-transform-simplify-comparison-operators), [function-to-arrow](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-function-to-arrow)
+ [ ] sequences
+ [ ] if_return
+ [ ] cascade
+ [ ] keep_fargs
+ [x] keep_fnames - [mangle-options](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-mangle#options), [function-to-arrow-options](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-function-to-arrow#options)

## Packages overview

### [gulp-babel-minify](https://github.com/boopathi/babel-minify/blob/master/packages/gulp-babel-minify)

```js
import minify from 'gulp-babel-minify';

gulp.task('min', function() {
  return gulp.src('build/temp/app.bundle.js')
    .pipe(minify(opts))
    .pipe(gulp.dest('build/'));
})
```

### [babel-minify](https://github.com/boopathi/babel-minify/blob/master/packages/babel-minify)

+ Node API + CLI

```js
import minify from 'babel-minify';
minify(inputCode, {
  conditionals: true,
  drop_debugger: true
});
```

More details here - https://github.com/boopathi/babel-minify/blob/master/packages/babel-minify

### [babel-preset-min](https://github.com/boopathi/babel-minify/blob/master/packages/babel-preset-min)

This is a preset that uses the default options of [babel-minify](https://github.com/boopathi/babel-minify/tree/master/packages/babel-minify)

**WARNING:** This might cause some regression, depending on what other plugins and presets you use with this preset - because all the plugins are applied in one pass by default in babel. You can enable the `passPerPreset` option in babel, but then all the `babel-minify` plugins are still applied in one pass. So, consider using  `babel-minify` NodeAPI or CLI or Gulp task with the [options](https://github.com/boopathi/babel-minify/tree/master/packages/babel-minify#options) - `plugins: []` and `presets: []` to pass your other plugins and presets.

```json
{
  "presets": ["min"],
  "comments": false,
  "compact": true,
  "minified": true
}
```

## Sample App Usage

When you bundle your code, remember to split your bundle into multiple packages or at least `vendor` and your `app` code separately. Usually, the vendor code will be ES5 compatible and UglifyJS does a better job here. And all the code you write is mostly ES6. You may want to ship this ES6 code to browsers. So we can pass this ES6 code via babel using a specific set of plugins applied in some fashion and make it do the optimizations and minification for you.

**webpack.config.js**

```js
// webpack.config.js
module.exports = {
  entry: {
    app: './src/app.js'
    vendor: ['react', 'react-router', 'lodash', 'my-polyfills']
  },
  output: {
    path: 'build/webpack',
    filename: '[name].bundle.js'
  }
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor')
  ]
}
```

So, this would generate two files - `vendor.bundle.js` & `app.bundle.js`

**gulpfile.js**

```js
const uglify = require('gulp-uglify');
const minify = require('gulp-babel-minify');
const webpack = require('webpack');
const config = require('./webpack.config.js');

gulp.task('webpack', function(cb) {
  webpack(config, (err, stats) => {
    if (err) return cb(err);
    console.log(stats.toString());
    cb();
  });
});

gulp.task('minify-vendor', ['webpack'], function() {
  return gulp.src('build/webpack/vendor.bundle.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/minified'));
});

gulp.task('minify-app', ['webpack'], function() {
  return gulp.src('build/webpack/app.bundle.js')
    .pipe(minify())
    .pipe(gulp.dest('build/minified'));
});
```

## LICENSE

http://boopathi.mit-license.org
