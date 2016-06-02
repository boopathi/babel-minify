import {transform} from 'babel-core';
import test from 'tape';
import shortIdentifier from '../packages/babel-plugin-short-identifiers';
import {compare} from '../utils';

const babelOpts = {
  plugins: [shortIdentifier],
  babelrc: false
};

const input =
`
import $ from 'jquery';

var test = "";
{
  var test1 = "";
}

let one = 1;
let two = 2, three = 3, four = 4;
var x = 5;

var obj = {
  method() {},
  fn: function() {},
  namedfn: function named() {}
}

function doSomething() {
  var one = 1, two = 2, three = 3;
  function doSomethingElse() {
    var one = 1, two = 2, three = 3;
    {
      let one = 1, two = 2, three = 3;
    }
  }
}

export var window = 5;
export var document = this;
`;

const expected = `
import a from 'jquery';

var b = "";
{
  var c = "";
}

let d = 1;
let e = 2,
    f = 3,
    g = 4;
var h = 5;

var i = {
  method() {},
  fn: function () {},
  namedfn: function a() {}
};

function j() {
  var b = 1,
      c = 2,
      d = 3;
  function a() {
    var a = 1,
        b = 2,
        c = 3;
    {
      let a = 1,
          b = 2,
          c = 3;
    }
  }
}

var k = 5;
export { k as window };
var l = this;
export { l as document };
`;

test('short-identifiers', function(t) {
  const code = transform(input, babelOpts).code;
  t.assert(compare(code, expected));
  t.end();
});
