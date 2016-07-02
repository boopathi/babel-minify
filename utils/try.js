/* eslint-disable */
const plugin = require('../packages/babel-plugin-transform-evaluate');
const babel = require('babel-core');
const minify = require('../packages/babel-minify');

let input =
`
function asdf() {}
function a() {
  var x = 5;
  let [y] = [0, x];
  {
    var z = 5;
    let r = 1;
    function asdf () {}
  }
  asdf();

  function b() {}
  b();
}
`

input = `

{
  function a() {}
}
a();
`

// const output = babel.transform(input, {
//   babelrc: false,
//   plugins: [plugin]
// });

const output = minify(input, {
  mangle_globals: true,
  npasses: 1,
});

console.log('Input:');
console.log(input);
console.log('Output:');
console.log(output);
