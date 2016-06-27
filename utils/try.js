/* eslint-disable */
const plugin = require('../packages/babel-plugin-transform-evaluate');
const babel = require('babel-core');

const input = `
function a() {
  var x = 5;
  let y = 6;
  function b() {
    y = 7 + x * 2;
    y = x % 2 === 0 ? x : x + 5;
  }
  console.log(x+6);
  var NODE_ENV = 'production';
  if (NODE_ENV !== 'production') {
    console.log('dev');
  } else if (false) {
    let x = 5;
    console.log('blahblah');
  } else {
    console.log('neither');
  }
}
`;

const output = babel.transform(input, {
  babelrc: false,
  plugins: [plugin]
});

console.log(input, output.code);
