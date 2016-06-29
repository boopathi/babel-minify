# babel-plugin-transform-mangle

Mangle Identifiers that can be shortened

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

+ `keep_fnames`: [Default: false] Don't mangle function names for FunctionExpressions and FunctionDeclarations - Useful for code depending on `fn.name`.

+ `mangle_globals`: [Default: false] Mangle variables in the outermost scope.
