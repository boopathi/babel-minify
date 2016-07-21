import evaluate from '../src';

function test(input) {
  return trim(transform(input, {
    plugins: [evaluate],
    babelrc: false,
  }).code);
}

describe('babel-plugin-transform-evaluate', function () {
  it('should transform binary expressions', function () {
    expect(
      test('var x = 1 + 2 + 3 + 4 % 5;')
    ).toEqual(
      trim('var x = 10')
    );
  });

  it('should transform logical expressions', function () {
    expect(
      test('const y = true && false || "default value";')
    ).toEqual(
      trim('const y = "default value"')
    );
  });

  it('should transform simple call expressions', function () {
    expect(
      test(`
        var x = 1+2+3+4%5+Math.ceil(4.5);
        function y() { return 4 };
        y();
      `)
    ).toEqual(
      trim(`
        var x = 15;
        function y() {return 4};
        y();
      `)
    );
  });

  it('should not transform (1, func)(something) to func(something)', function () {
    expect(
      test('(1, eval)("x=4")')
    ).toEqual(
      trim('(1, eval)("x=4")')
    );
  });

  it('should not fail to deopt for object and array pattern', function () {
    expect(
      test('var x = 5; var [y] = [x]; { x = 6 }')
    ).toEqual(
      trim('var x = 5; var [y] = [x]; { x = 6 }')
    );
  });

  it('should not replace when the evaluated result is longer than source', function () {
    expect(
      test('1/3')
    ).toEqual(
      trim('1/3')
    );
  });
});
