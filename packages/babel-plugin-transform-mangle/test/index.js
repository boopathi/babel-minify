import mangle from '../src';

function test(input, option, optionval) {
  return trim(transform(input, {
    plugins: void 0 !== option ? [ [ mangle, { [option]: optionval} ] ] : [mangle],
    babelrc: false,
    comments: false
  }).code);
}

function testGlobals(input) {
  return test(input, 'topLevel', true);
}
function testFnames(input) {
  return test(input, 'keep_fnames', true);
}
function testExcept(input, except) {
  return test(input, 'except', except);
}
function testEval(input) {
  return test(input, 'eval', true);
}

// fixtures with default options
const fixtures = {
  dont_mangle_globals: {
    input: '{ var someGlobalName = 0; } function blahblahblah() {}',
    expected: '{ var someGlobalName = 0; } function blahblahblah() {}',
  },
  exports_and_imports: {
    input: 'import $ from "jQuery"; export default function Blah() {}',
    expected: 'import $ from "jQuery"; export default function Blah() {}',
  },
  inner_scopes: {
    input: 'function a() { var longname = 1; var longlongname = 1 }',
    expected: 'function a() { var b = 1; var c = 1; }',
  },
  nested_vars: {
    input: `
      (function() {
        var longName = 1; let something = longName; const zero = something - 1;
        { var long2Name = 2; let something = long2Name; const zero = something - 1 }
      })();
    `,
    expected: `
      (function() {
        var a = 1; let b = a; const c = b - 1;
        { var d = 2; let e = d; const f = e - 1; }
      })();
    `,
  },
  // https://github.com/boopathi/babel-minify/issues/11
  global_global_vars: {
    input: 'function foo() { var bar = 1; var baz = a + bar }',
    expected: 'function foo() { var b = 1; var c = a + b }'
  },
  properties_and_methods: {
    input: `
      (function() {
        class Hello { method1() {} }
        function World() { this._world = 'earth'}
        var foo = { bar() {}, baz: true };
      })();
    `,
    expected: `
      (function() {
        class b { method1() {} }
        function a() { this._world='earth' }
        var c = { bar() {}, baz: true }
      })();
    `
  },
  // https://github.com/boopathi/babel-minify/issues/7
  vars_in_blocks: {
    input: 'function foo() { var bar; { var bar; function baz() {} } }',
    expected: 'function foo() { var a; { var a; function b () {} }}'
  }
};

describe('babel-plugin-transform-mangle', function () {
  // fixtures
  Object.keys(fixtures).forEach(name => {
    it('should work for the fixture - ' + name, function () {
      expect(
        test(fixtures[name].input)
      ).toEqual(
        trim(fixtures[name].expected)
      );
    });
  });

  // mangle_globals
  it('should mangle_globals when set to true', function () {
    expect(
      testGlobals('var foo = 1; let bar = 0; import baz from "baz"')
    ).toEqual(
      trim('var a = 1; let b = 0; import c from "baz"')
    );
  });

  it('should NOT treat block functions as globals', function () {
    expect(
      testGlobals('function foo() {} { function foo() {} } foo() ')
    ).toEqual(
      trim('function a() {} { function b() {} } a()')
    );
  });

  // keep_fnames
  it('should preserve class names when keep_fnames is true', function () {
    expect(
      testFnames('function foo() { class bar {} }')
    ).toEqual(
      trim('function foo() { class bar{} }')
    );
    expect(
      testFnames('function foo() { var bar = class bar {} }')
    ).toEqual(
      trim('function foo() { var a = class bar {} }')
    );
  });

  it('should preserve function names when keep_fnames is true', function () {
    expect(
      testFnames('function foo() { function bar() {} }')
    ).toEqual(
      trim('function foo() { function bar() {} }')
    );
    expect(
      testFnames('function foo() { var bar = { baz: function baz() {} } }')
    ).toEqual(
      trim('function foo() { var a = { baz: function baz() {} } }')
    );
  });

  // eval deopt
  it('should deopt all variables of all scopes accessible to eval', function () {
    expect(
      test('function baz () { var foo = 0; function bar() { eval() } }')
    ).toEqual(
      trim('function baz () { var foo = 0; function bar() { eval() } }')
    );
  });

  it('should NOT deopt variables that are not accessible to eval', function () {
    expect(
      test('function foo () { function bar() {eval()} function baz() { var evalCantSee; }}')
    ).toEqual(
      trim('function foo () { function bar() {eval()} function baz() { var a; }}')
    );
  });

  // eval option
  it('should Mangle names without deopt eval for eval=true', function () {
    expect(
      testEval('function baz () { var foo = 0; function bar() { eval() } }')
    ).toEqual(
      trim('function baz () { var b = 0; function a () { eval() }}')
    );
  });

  // new Function test
  it('should NOT mangle names when new Function is used and globals is true', function () {
    expect(
      testGlobals('function foo() { new Function(""); }')
    ).toEqual(
      trim('function foo() { new Function("") }')
    );
    expect(
      test('function foo() { new Function(""); }')
    ).toEqual(
      trim('function foo() { new Function(""); }')
    );
  });

  // except option tests
  it('should NOT mangle names that are listed in except<string> option', function () {
    expect(
      testExcept('(function() { var foo = 1; { let bar, baz; } })()', ['bar', 'foo'])
    ).toEqual(
      trim('(function() { var foo = 1; { let bar, a; } })()')
    );
  });

  // function
  it('should NOT mangle names in except<function>', function () {
    expect(
      testExcept(
        'function a() { var foobarbaz, barfoobaz, bazbarfoo, foobazbar }',
        [ name => name.substring(3, 6) === 'bar']
      )
    ).toEqual(
      trim('function a() { var foobarbaz, b, bazbarfoo, c }')
    );
  });
});
