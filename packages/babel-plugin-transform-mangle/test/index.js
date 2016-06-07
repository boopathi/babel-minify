import expect from 'expect';
import {transform} from 'babel-core';
import mangle from '../src';

import {trim} from '../../../utils';

const babelOpts = {
  plugins: [mangle],
  babelrc: false
};

describe('[babel-plugin-transform-mangle] - mangle', function() {
  it('should mangle imports', function() {
    const actual = transform(`import $ from 'jquery';`, babelOpts).code;
    const expected = `import a from 'jquery';`;
    expect(trim(actual)).toEqual(trim(expected));
  });

  it('should mangle imports and preserve names', function() {
    const actual = transform(`export const blahblah = 10;`, babelOpts).code;
    const expected = `
      const a = 10;
      export {a as blahblah};
    `;
    expect(trim(actual)).toEqual(trim(expected));
  });

  it('should mangle nested variable declarations', function() {
    const actual = transform(`
      var longName = 1;
      let something = longName;
      const zero = something - 1;
      {
        var long2Name = 2;
        let something = long2Name;
        const zero = something - 1;
      }
    `, babelOpts).code;
    const expected = `
      var a = 1;
      let b = a;
      const c = b - 1;
      {
        var d = 2;
        let e = d;
        const f = e - 1;
      }
    `;
    expect(trim(actual)).toEqual(trim(expected));
  });

  it('should not mangle property names', function() {
    const actual = transform(`
      var longName = "something";
      var object = {
        method1() {},
        method2: function method2() {
          longName += "somethingElse"
        }
      };
    `, babelOpts).code;

    const expected = `
      var a = "something";
      var b = {
        method1() {},
        method2: function c() {
          a += "somethingElse"
        }
      }
    `;
    expect(trim(actual)).toEqual(trim(expected));
  });
});
