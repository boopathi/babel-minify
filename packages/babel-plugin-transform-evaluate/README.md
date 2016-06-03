# babel-plugin-transform-evaluate

Attempt evaluating constant expressions

**In**

```js
const x = Math.floor(6.5) + 1 * 2 / 3 * 6 % 5 + myValue;
const y = true && false || "default value";
```

**Out**

```js
const x = 10 + myValue;
const y = "default value";
```
