# babel-plugin-transform-global-defs

Transform Global definitions that are available at build time

## Install

```
npm install babel-plugin-transform-global-defs
```

## Options

```json
{
  "global_defs": {
    "process.env": {
      "NODE_ENV": "production"
    }
  }
}
```

**In**

```js
if (process.env.NODE_ENV !== 'production') {
  DEBUG = true;
}
```

**Out**

```js
if ('production' !== 'production') {
  DEBUG = true;
}
```
