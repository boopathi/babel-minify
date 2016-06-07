# gulp-babel-minify

## Install

```
npm install gulp-babel-minify --save-dev
```

## Usage

```js
import minify from 'gulp-babel-minify';

gulp.task('min', function() {
  return gulp.src('build/temp/app.bundle.js')
    .pipe(minify(opts))
    .pipe(gulp.dest('build/'));
})
```
