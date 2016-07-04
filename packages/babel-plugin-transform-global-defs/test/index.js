import globalDefs from '../src';

function test(input, definitions) {
  return trim(transform(input, {
    plugins: [[globalDefs, {
      global_defs: definitions
    }]],
    babelrc: false
  }).code);
}

describe('babel-plugin-transform-global-defs', function () {
  it('should transform simple variables', function () {
    expect(
      test('x', {x: false})
    ).toEqual(
      trim('false')
    );
    // should stringify
    expect(
      test('x', {x: 'helloworld'})
    ).toEqual(
      trim('"helloworld"')
    );
    expect(
      test('x', {x: 5})
    ).toEqual(
      trim('5')
    );
  });

  it('should deopt when a global variable is re assigned', function () {
    expect(
      test('x = 5; x', {x:0})
    ).toEqual(
      trim('x = 5; x')
    );
  });

  it('should transform object member expressions', function () {
    expect(
      test('process.env.DEBUG', {process: {env: {DEBUG: false}}})
    ).toEqual(
      trim('false')
    );
  });

  it('should deopt object member expression when reassigned', function () {
    expect(
      test(
        'process.env.NODE_ENV = "test"; process.env.NODE_ENV',
        {process: {env: {NODE_ENV: 'production'}}}
      )
    ).toEqual(
      trim('process.env.NODE_ENV = "test"; process.env.NODE_ENV')
    );
  });

  it('should deopt object member expression when subpath is reassigned', function () {
    expect(
      test(
        'process.env = "test"; process.env.NODE_ENV',
        {process: {env: {NODE_ENV: 'production'}}}
      )
    ).toEqual(
      trim('process.env = "test"; process.env.NODE_ENV')
    );
  });

  it('should NOT deopt object member expression when a different subpath is changed', function () {
    expect(
      test(
        'process.env.somethingelse = 5; process.env.NODE_ENV',
        {process: {env: {NODE_ENV: 'production'}}}
      )
    ).toEqual(
      trim('process.env.somethingelse = 5; "production"')
    );
  });

  it('should NOT deopt when a same name local variable is changed', function () {
    expect(
      test(
        'if (1) { const x = "bar" }; x;',
        {x: 'foo'}
      )
    ).toEqual(
      trim('if (1) { const x = "bar" }; "foo";')
    );
  });

  it('should NOT deopt object member expression for a local variable change', function () {
    expect(
      test(
        'if (1) { const process = {} }; process.env.DEBUG',
        {process: {env: {DEBUG: false}}}
      )
    ).toEqual(
      trim('if (1) { const process = {} }; false')
    );
  });

  it('should deopt when variable is changed inside any of the functions', function () {
    expect(
      test(
        'function a() { process = {}; DEBUG = true }; process.env.NODE_ENV; DEBUG;',
        {process: {env: { NODE_ENV: 'development'}}, DEBUG: false}
      )
    ).toEqual(
      trim('function a() { process = {}; DEBUG = true }; process.env.NODE_ENV; DEBUG')
    );
  });

  it('should deopt only things that changed - multiple defs test', function () {
    expect(
      test(
        'function a() { process.env.A = "hello"; }; process.env.A; process.env.B; DEBUG',
        {process: {env: { A: 'hi', B: 'world'}}, DEBUG: true}
      )
    ).toEqual(
      trim('function a() { process.env.A="hello"; }; process.env.A; "world"; true')
    );
  });

  it('should not convert identifiers in random places', function () {
    expect(
      test(
        'function a(DEBUG) {}; DEBUG;',
        {DEBUG: true}
      )
    ).toEqual(
      trim('function a(DEBUG) {}; true;')
    );
  });
});
