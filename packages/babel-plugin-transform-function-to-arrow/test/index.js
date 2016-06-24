import expect from 'expect';
import {transform} from 'babel-core';
import functionToArrow from '../src';

import {trim} from '../../../utils';

const babelOpts = {
  babelrc: false,
  plugins: [functionToArrow]
};

describe('[babel-plugin-transform-function-to-arrow]', function() {
  it('should transform var x = function expression', function() {
    const actual = transform(`
      var x = function () {}
    `, babelOpts).code
    const expected = `var x = 10`;
    expect(trim(actual)).toEqual(trim(expected));
  });
  it('should transform logical expressions', function() {
    const actual = transform(`
      const y = true && false || "default value";
    `, babelOpts).code
    const expected = `const y = "default value"`;
    expect(trim(actual)).toEqual(trim(expected));
  });
  it('should transform simple call expressions', function() {
    const actual = transform(`
      var x = 1+2+3+4%5+Math.ceil(4.5);
      function y() { return 4 };
      y();
    `, babelOpts).code
    const expected = `
      var x = 15;
      function y() {return 4};
      y();
    `;
    expect(trim(actual)).toEqual(trim(expected));
  });
  it('should not transform (1, func)(something) to func(something)', function() {
    const actual = transform(`
      (1, eval)('x=4')
    `, babelOpts).code
    const expected = `(1,eval)('x=4')`;
    expect(trim(actual)).toEqual(trim(expected));
  });
});
