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

Options and defaults

```js
{
  mangle        = true,

  dead_code     = false,
  conditionals  = true,
  global_defs   = {},
  evaluate      = true, // eval constant expressions
  drop_debugger = false,
  drop_console  = false,
  properties    = true,
  join_vars     = true,
  booleans      = true,
  unsafe        = true,

  // passed on to babel transform to tell whether to use babelrc
  babelrc       = false,

  // should there by any other plugins added to this build process
  plugins       = [],

  // if false, babel-minify can give a list of plugins to use as a preset
  minify        = true,
}
```
