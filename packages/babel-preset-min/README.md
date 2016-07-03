# babel-preset-min

This is a preset that uses the default options of [babel-minify](https://github.com/boopathi/babel-minify/tree/master/packages/babel-minify)

Check [babel-minify#options](https://github.com/boopathi/babel-minify/tree/master/packages/babel-minify#options) to find the default transformations applied or to find what exactly this preset will do.

## Install

```
npm install babel-preset-min --save-dev
```

### .babelrc

```json
{
  "presets": ["min"],
  "comments": false,
  "compact": true,
  "minified": true,
  "passPerPreset": true
}
```
