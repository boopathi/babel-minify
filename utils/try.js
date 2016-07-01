/* eslint-disable */
const plugin = require('../packages/babel-plugin-transform-evaluate');
const babel = require('babel-core');
const minify = require('../packages/babel-minify');

let input = `
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
    function abc() {
      console.log('whatever');
    }
  } else if (false) {
    var abcd = "Asdf";
  } else if (false) {
    var aaaa = "asdfsdfasdf";
    function whatever() {
      console.log('whatever');
    }
  }
  else if (false) {
    let x = 5;
    console.log('blahblah');
  } else {
    console.log('neither');
  }

  if (false) {
    var {a} = something;
  }
}
`;

input = `
function a() {
  var x = 5;
  let [y] = [0, x];
  {
    var z = 5;
    let r = 1;
    function asdf () {}
  }
  asdf();
}
`

// input = `{ var a; let b; }`

// const output = babel.transform(input, {
//   babelrc: false,
//   plugins: [plugin]
// });

const output = minify(input, {
  mangle_globals: false
});

console.log('Input:');
console.log(input);
console.log('Output:');
console.log(output);
