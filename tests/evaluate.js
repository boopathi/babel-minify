const babel = require('babel-core');
const evaluate = require('../packages/babel-plugin-transform-evaluate');

const input = `
const x = 5 && true && doSomething();
const y = true && false || "default value";
const z = 1+2+3+4*7%4 + Math.ceil(4.5);
function a(x) { this[x] = x; };
(0, a)('test');
`;

const out = babel.transform(input, {
  plugins: [evaluate],
  babelrc: false
}).code;

console.log(out);
