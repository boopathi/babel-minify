import sequences from '../src';

function test(input) {
  return trim(transform(input, {
    plugins: [ sequences ],
    babelrc: false
  }).code);
}

describe('babel-plugin-transform-sequences', function () {
  it('should join statements using comma operator', function () {
    expect(
      test('if (1) { hello(); if(true) { phew(); } }')
    ).toEqual(
      trim('if(1)if(hello(),true)phew();')
    );
  });
});
