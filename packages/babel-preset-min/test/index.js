import expect from 'expect';
import preset from '../';

describe('[babel-preset-min]', function() {
  it('should contain an array of plugins', function() {
    expect(preset.plugins).toBeAn('array');
    expect(preset.plugins.length).toBeGreaterThanOrEqualTo(1);
  });
});
