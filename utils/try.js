/* eslint-disable */
const plugin = require('../packages/babel-plugin-transform-global-defs');
const babel = require('babel-core');
const minify = require('../packages/babel-minify');

let input =
`
if (a) {
  console.log('hi');
}
`

// const output = babel.transform(input, {
//   babelrc: false,
//   plugins: [[plugin, {
//     global_defs: {process: {env: { A: 'hi', B: 'world'}}, DEBUG: true}
//   }]]
// }).code;

const output = minify(input, {
  global_defs: {
    a: 1
  }
});

console.log('Input:');
console.log(input);
console.log('Output:');
console.log(output);
