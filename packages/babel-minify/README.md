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
  keep_fnames   = false,

  // passed on to babel transform to tell whether to use babelrc
  babelrc       = false,

  // should there by any other plugins added to this build process
  plugins       = [],

  // if false, babel-minify can give a list of plugins to use as a preset
  minify        = true,
}
```

## Internals

Plugins used for specific options

+ [mangle](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-mangle)
+ [dead_code](https://www.npmjs.com/package/babel-plugin-transform-dead-code-elimination)
+ conditionals - [conditional-compile](https://www.npmjs.com/package/babel-plugin-conditional-compile)
+ global_defs - [conditional compile options](https://www.npmjs.com/package/babel-plugin-conditional-compile#via-node-api)
+ [evaluate](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-evaluate)
+ [drop_debugger](https://www.npmjs.com/package/babel-plugin-transform-remove-debugger)
+ [drop_console](https://www.npmjs.com/package/babel-plugin-transform-remove-console)
+ properties - [member-expression-literals](https://www.npmjs.com/package/babel-plugin-transform-member-expression-literals), [property-literals](https://www.npmjs.com/package/babel-plugin-transform-property-literals)
+ [join_vars](https://www.npmjs.com/package/babel-plugin-transform-merge-sibling-variables)
+ booleans - [minify booleans](https://www.npmjs.com/package/babel-plugin-transform-minify-booleans)
+ unsafe - [undefined-to-void](https://www.npmjs.com/package/babel-plugin-transform-undefined-to-void), [simplify-comparison-operators](https://www.npmjs.com/package/babel-plugin-transform-simplify-comparison-operators)
+ keep_fnames - [mangle-options](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-mangle#options)
