/* eslint-disable */
const plugin = require('../packages/babel-plugin-transform-evaluate');
const babel = require('babel-core');

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

  if (true) {
    var a = 5;
  }
}
`;

// input = `
// if (false) {
//   let x = 5;
//   var a = 1;
//   {
//     var z = 6;
//   }
//   function c() {
//     var a = 1;
//   }
// }
// `

const output = babel.transform(input, {
  babelrc: false,
  plugins: [plugin]
});

console.log('Input:');
console.log(input);
console.log('Output:');
console.log(output.code);
