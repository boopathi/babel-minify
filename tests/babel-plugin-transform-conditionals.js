import {transform} from 'babel-core';
import test from 'tape';
import conditionals from '../packages/babel-plugin-transform-conditionals';
import {compare} from '../utils';

const babelOpts = {
  plugins: [conditionals],
  babelrc: false
};

const input =`
if (true && false) {
  something();
} else if (false) {
  somethingelse();
} else {
  someotherthing();
}

if (x) {}

`;

test('conditionals', function(t) {
  const code = transform(input, babelOpts).code;
  console.log(code);
  // t.assert(compare(code, expected));
  t.end();
});
