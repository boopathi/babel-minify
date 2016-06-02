# babel-plugin-transform-conditionals

In:

```js
if (true && false && true && true) {
  something();
} else {
  whatever();
}


```

Out:

```js
whatever()
```
