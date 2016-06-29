# babel-plugin-transform-conditionals

Transform conditional expressions and remove dead code.

## Install

```
npm install babel-plugin-transform-conditionals
```

**In**

```js
if (false) {
  doSomething();
} else {
  doSomethingElse();
}
```

**Out**

```js
doSomethingElse()
```
