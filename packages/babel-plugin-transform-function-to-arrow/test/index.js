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
    const expected = `var x = () => {}`;
    expect(trim(actual)).toEqual(trim(expected));
  });
});
