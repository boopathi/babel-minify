import functionToArrow from '../src';

function test(input) {
  return trim(transform(input, {
    plugins: [functionToArrow],
    babelrc: false
  }).code);
}

function testOpts(input) {
  return trim(transform(input, {
    plugins: [[functionToArrow, {keep_fnames: true}]],
    babelrc: false
  }).code);
}

describe('babel-plugin-transform-function-to-arrow', function () {
  it('should transform var x = function expression', function () {
    expect(
      test('var x = function () {}')
    ).toEqual(
      trim('var x = () => {}')
    );
  });

  it('should transform single return arrows', function () {
    expect(
      test('var x = () => { return 5 }')
    ).toEqual(
      trim('var x = () => 5')
    );
  });

  it('should transform single return functions', function () {
    expect(
      test('var y = function (a) { return doSomething(a) + a; }')
    ).toEqual(
      trim('var y = a => doSomething(a) + a')
    );
  });

  it('should not transform functions with this and arguments', function () {
    expect(
      test('var x = function () { return arguments[0]; }')
    ).toEqual(
      trim('var x = function () { return arguments[0]; }')
    );
    expect(
      test('const a = function (x) { this.x = x }')
    ).toEqual(
      trim('const a = function (x) { this.x = x }')
    );
  });

  it('should transform named functions by default (keep_fnames=false)', function () {
    expect(
      test('var x = function x() { return 5 }')
    ).toEqual(
      trim('var x = () => 5')
    );
  });

  it('should NOT transform named functions for keep_fnames=true', function () {
    expect(
      testOpts('var x = function x() { return 5 }')
    ).toEqual(
      trim('var x = function x() { return 5 }')
    );
  });
});
