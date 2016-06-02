import {transform} from 'babel-core';
import test from 'tape';
import requireToImport from '../packages/babel-plugin-require-to-import';
import {compare} from '../utils';

const babelOpts = {
  plugins: [requireToImport],
  babelrc: false
};

const input =
`
const a = require('a');
const b = require('b').x;
const c = require('c'),
      d = require('d').y.z;
const e = require('e'),
      f = "someotherthing",
      g = require('g').something.somethingelse(),
      h = require('h');

require('some-thing/lib/asdf');
`

const expected =
`
import a from 'a';
import $b from 'b';
import c from 'c';
import $d from 'd';
import e from 'e';
import $g from 'g';
import h from 'h';
import $someThingLibAsdf from 'some-thing/lib/asdf';

const b = $b.x;
const d = $d.y.z;
const f = "someotherthing",
      g = $g.something.somethingelse();

$someThingLibAsdf;
`

test('require-to-import', function(t) {
  const code = transform(input, babelOpts).code;
  t.assert(compare(code, expected));
  t.end();
});
