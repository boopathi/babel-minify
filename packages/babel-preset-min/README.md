# babel-preset-min

## Install

```
npm install babel-preset-min --save-dev
```

**Plugins:**

+ [babel-plugin-transform-mangle](https://npmjs.com/package/babel-plugin-transform-mangle)
+ [babel-plugin-transform-member-expression-literals](https://npmjs.com/package/babel-plugin-transform-member-expression-literals)
+ [babel-plugin-transform-merge-sibling-variables](https://npmjs.com/package/babel-plugin-transform-merge-sibling-variables)
+ [babel-plugin-transform-minify-booleans](https://npmjs.com/package/babel-plugin-transform-minify-booleans)
+ [babel-plugin-transform-property-literals](https://npmjs.com/package/babel-plugin-transform-property-literals)
+ [babel-plugin-transform-simplify-comparison-operators](https://npmjs.com/package/babel-plugin-transform-simplify-comparison-operators)
+ [babel-plugin-transform-undefined-to-void](https://npmjs.com/package/babel-plugin-transform-undefined-to-void)

### .babelrc

```json
{
  "presets": ["min"],
  "comments": false,
  "compact": true,
  "minified": true
}
```
