import nameGenerator from '../src/namegen';

describe('babel-plugin-transform-mangle', function() {
  it('should work for a small sample of 200', function() {
    const gen = nameGenerator();
    let i = 0, limit = 250;

    function verify(x, y, character, value) {
      expect(x ? character + x : character).toEqual(value);
    }

    do {
      let x = parseInt(i / 52);
      let y = i % 52;
      let next = gen.next().value;
      switch (y) {
        case 0:
        verify(x, y, 'a', next);
        break;
        case 13:
        verify(x, y, 'n', next);
        break;
      }
    } while (i++ < limit);
  });
});
