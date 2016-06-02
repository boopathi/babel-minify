# babel-plugin-transform-mangle

Mangle Identifiers that can be shortened

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
