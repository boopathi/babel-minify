# babel-plugin-transform-mangle

Mangle Identifiers

## Install

```
npm install babel-plugin-transform-mangle --save-dev
```
## Example

**In :**

```js
import MyAwesomeLib from 'my-awesome-lib';
const ReallyLongName = "1";
class BlahBlahBlahBlah {
  method() {}
}
function doSomethingWithAReallyLongName() {
  var localVariable, someIdentifier;
}
```

**Out :**

```js
import a from 'my-awesome-lib';
const b = "1";
class c {
  method() {}
}
function d() {
  var a, b;
}
```

## Options

+ `keep_fnames`: [Default: false] Don't mangle function names for FunctionExpressions and FunctionDeclarations - Useful for code depending on `fn.name`

+ `topLevel`: [Default: false] Mangle variables in the outermost scope

+ `eval`: [Default: false] Don't deopt from mangling when eval is found in the subtree

+ `except`: [Default: []] Pass in an array of strings or functions or RegExps to match against the variable name that is mangled. If there is a match, then that variable name will NOT be mangled.
