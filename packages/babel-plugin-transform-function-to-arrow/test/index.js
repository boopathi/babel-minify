import functionToArrow from '../src';

function test(input) {
  return trim(transform(input, {
    plugins: [functionToArrow],
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
});
