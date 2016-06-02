import {transform} from 'babel-core';
import test from 'tape';
import moduleExportsToExport from '../packages/babel-plugin-module-exports-to-export';
import {compare} from '../utils';

const babelOpts = {
  plugins: [moduleExportsToExport],
  babelrc: false
};

const cases =
  [ `module.exports = function() {}`
  , `module.exports = class {}`
  , `class A {}; module.exports = A`
  , `module.exports = a; module.exports = b`
  ];

const expected =
  [ `export default (function() {})`
  , `export default (class {})`
  , `export default class A {}`
  , {throws: true}
  ];

test('module-exports-to-export', function(t) {
  cases.map((c, i) => {
    if (typeof expected[i] === 'string') {
      const {code}= transform(c, babelOpts)
      t.assert(compare(code, expected[i]), "Code = " + code + "Expected = " + expected[i]);
    } else {
      if (expected[i].throws) {
        const fn = () => transform(c, babelOpts);
        t.throws(fn);
      }
    }
  });
  t.end();
});
