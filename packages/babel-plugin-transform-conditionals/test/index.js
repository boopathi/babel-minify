import conditionals from '../src';

function test(input) {
  return trim(transform(input, {
    plugins: [conditionals],
    babelrc: false
  }).code);
}

describe('babel-plugin-transform-conditionals', function () {
  it('should remove simple conditionals', function () {
    expect(
      test('if (false) { a() ;} else { b() }')
    ).toEqual(
      trim('b()')
    );
    expect(
      test('if (true) { a() } else { b() }')
    ).toEqual(
      trim('a()')
    )
  });

  it('should preserve block for declarations', function () {
    expect(
      test('if (1) { let x = a; }')
    ).toEqual(
      trim('{let x = a;}')
    );
  });

  it('should preserve declarations in the removed part', function () {
    expect(
      test('if (1) { var a = 5 } else { var b = 6 }')
    ).toEqual(
      trim('var a = 5; var b;')
    );
    expect(
      test('if (0) { var x = "blah" } else { var y = false; }')
    ).toEqual(
      trim('var x; var y = false')
    );
  });

  it('should treat non block statements the same way', function () {
    expect(
      test('if (1) var a = 5; else var b = 6;')
    ).toEqual(
      trim('var a = 5; var b;')
    );
  });

  it('should work with conditional operator', function () {
    expect(test('false ? a : b')).toEqual(trim('b'));
    expect(test('true ? a : b')).toEqual(trim('a'));
  });

  it('should evaluate conditional.test', function () {
    expect(
      test('if (false && true || 0) { var x = 5; }')
    ).toEqual(
      trim('var x;')
    );
    expect(
      test('if ((5 + 10) % 10 - 4 && "asdf".indexOf("a") > -1) { var x = 5; }')
    ).toEqual(
      trim('var x = 5;')
    );
  });

  it('should treat functions within block as strict mode Issue#14', function () {
    expect(
      test('if(false) {function a() {}} a();')
    ).toEqual(
      trim('a()')
    );
  });
});
