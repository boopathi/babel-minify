# babel-plugin-transform-function-to-arrow

Transforms functions to arrows and simplifies arrow functions with single return statement

## Install

```
npm install babel-plugin-transform-function-to-arrow
```

**In**

```js
const x = function (a, b) { return a + b }
const y = (x) => {
  return Math.sin(x);
}
const z = function () {
  return arguments[0];
}
```

**Out**

```js
const x = (a,b) => a+b;
const y = x => Math.sin(x);
const z = function () {
  return arguments[0];
}
```

## Options

+ `keep_fnames`: [Default: false] Don't transform functions to arrows for FunctionExpressions with names - Useful for code depending on `fn.name`.
