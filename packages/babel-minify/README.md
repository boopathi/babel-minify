# babel-minify

Node API + CLI

## Install

```
npm install babel-minify --save-dev
```

## Example

```js
import minify from 'babel-minify';
const outputCode = minify(inputCode, {
  conditionals: true,
  drop_debugger: true
});
```

## Options

+ `conditionals` - [boolean] | optimize conditional expressions and statements
+ `global_defs` - [object] Global Objects that need to be inserted at build time
+ `evaluate` - [boolean] Evaluate constant expressions
+ `dead_code` - [boolean] Remove dead code
+ `drop_debugger` - [boolean] Drop `debugger` statements
+ `drop_console` - [boolean] Drop console log, error, and info statements
+ `babelrc` - [boolean] Should other babelrc be used for transpiling
