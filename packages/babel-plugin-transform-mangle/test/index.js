import fs from 'fs';
import path from 'path';
import mangle from '../src';

const babelOpts = {
  plugins: [mangle],
  babelrc: false,
  comments: false
};

function getTestData(filename, babelOpts) {
  const actualFile = path.join(__dirname, 'fixtures', `${filename}.actual.js`);
  const expectedFile = path.join(__dirname, 'fixtures', `${filename}.expected.js`);
  const actual = transform(String(fs.readFileSync(actualFile)), babelOpts).code;
  const expected = String(fs.readFileSync(expectedFile));
  return {
    actual,
    expected,
    actualT: trim(actual),
    expectedT: trim(expected)
  };
}

describe('babel-plugin-transform-mangle', function() {
  it('should mangle imports', function() {
    const {actualT, expectedT} = getTestData('imports', babelOpts);
    expect(actualT).toEqual(expectedT);
  });

  it('should mangle exports and preserve names', function() {
    const {actualT, expectedT} = getTestData('exports', babelOpts);
    expect(actualT).toEqual(expectedT);
  });

  it('should mangle nested variable declarations', function() {
    const {actualT, expectedT} = getTestData('nested-vars', babelOpts);
    expect(actualT).toEqual(expectedT);
  });

  it('should not mangle property names', function() {
    const {actualT, expectedT} = getTestData('properties-and-methods', babelOpts);
    expect(actualT).toEqual(expectedT);
  });

  it('should not mangle function names for keep_fnames', function() {
    const babelOpts = {
      plugins: [[mangle, {
        keep_fnames: true
      }]],
      babelrc: false
    };
    const {actualT, expectedT} = getTestData('keep_fnames', babelOpts);
    expect(actualT).toEqual(expectedT);
  });

  it('should not mangle globals by default', function() {
    const {actualT, expectedT} = getTestData('dont_mangle_globals', babelOpts);
    expect(actualT).toEqual(expectedT);
  });

  it('should mangle_globals when set to true', function() {
    const babelOpts = {
      plugins: [[mangle, {
        mangle_globals: true
      }]],
      babelrc: false
    };
    const {actualT, expectedT} = getTestData('mangle_globals', babelOpts);
    expect(actualT).toEqual(expectedT);
  });

  it('should take care or vars in blocks', function() {
    const {actualT, expectedT} = getTestData('vars_in_blocks', babelOpts);
    expect(actualT).toEqual(expectedT);
  });

  it('should take care global vars and should not declare global in local scope', function() {
    const {actualT, expectedT} = getTestData('global_vars', babelOpts);
    expect(actualT).toEqual(expectedT);
  });
});
