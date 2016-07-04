/* eslint-disable */
const plugin = require('../packages/babel-plugin-transform-global-defs');
const babel = require('babel-core');
const minify = require('../packages/babel-minify');

let input =
`
function X() {
  process.x = 'production';
}

if (process.env.NODE_ENV === 'production') {
  console.log('hi');
}
`

const output = babel.transform(input, {
  babelrc: false,
  plugins: [[plugin, {
    global_defs: {
      process: {
        env: {
          NODE_ENV: 'production'
        }
      }
    }
  }]]
}).code;

// const output = minify(input, {
//   mangle_globals: true,
//   npasses: 1,
// });

console.log('Input:');
console.log(input);
console.log('Output:');
console.log(output);
