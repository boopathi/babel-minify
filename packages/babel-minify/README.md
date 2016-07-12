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
  mangle         = true,
  mangle_globals = false,

  dead_code      = false,
  conditionals   = true,
  evaluate       = true, // eval constant expressions
  drop_debugger  = false,
  drop_console   = false,
  properties     = true,
  join_vars      = true,
  booleans       = true,
  unsafe         = true,
  keep_fnames    = false,

  // global_defs
  global_defs    = {},

  // number of passes
  passes         = 1,

  // passed on to babel transform to tell whether to use babelrc
  babelrc        = false,

  // should there be any other plugins added to this build process
  plugins        = [],

  // should there be any other presets
  presets        = [],

  // if false, babel-minify can give a list of plugins to use as a preset
  minify         = true,
}
```

## Internals

Plugins used for specific options

+ [mangle](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-mangle)
+ [mangle-options](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-mangle#options) - Pass in a boolean to enable(defaults)/disable or pass in an object with these options
  + `keep_fnames`: [Default: false] Don't mangle function names for FunctionExpressions and FunctionDeclarations - Useful for code depending on `fn.name`. Note - This overrides keep_fnames in the global options (look below)
  + `topLevel`: [Default: false] Mangle variables in the outermost scope
  + `eval`: [Default: false] Don't deopt from mangling when eval is found in the subtree
  + `except`: [Default: []] Pass in an array of strings or functions or RegExps to match against the variable name that is mangled. If there is a match, then that variable name will NOT be mangled.
+ [dead_code](https://www.npmjs.com/package/babel-plugin-transform-dead-code-elimination)
+ [conditionals](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-conditionals)
+ [global_defs](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-global-defs)
+ [evaluate](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-evaluate)
+ [drop_debugger](https://www.npmjs.com/package/babel-plugin-transform-remove-debugger)
+ [drop_console](https://www.npmjs.com/package/babel-plugin-transform-remove-console)
+ properties - [member-expression-literals](https://www.npmjs.com/package/babel-plugin-transform-member-expression-literals), [property-literals](https://www.npmjs.com/package/babel-plugin-transform-property-literals)
+ [join_vars](https://www.npmjs.com/package/babel-plugin-transform-merge-sibling-variables)
+ booleans - [minify booleans](https://www.npmjs.com/package/babel-plugin-transform-minify-booleans)
+ unsafe - [undefined-to-void](https://www.npmjs.com/package/babel-plugin-transform-undefined-to-void), [simplify-comparison-operators](https://www.npmjs.com/package/babel-plugin-transform-simplify-comparison-operators), [function-to-arrow](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-function-to-arrow)
+ keep_fnames - [mangle-options](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-mangle#options), [function-to-arrow-options](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-function-to-arrow#options)
