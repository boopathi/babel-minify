import expect from 'expect';
import minify from '../';

describe('[babel-minify]', function() {
  it('should throw when input is null', function() {
    const inputs = [null, false, void 0];
    inputs.forEach(input => {
      expect(() => minify(input)).toThrow();
    });
  });

  it('should NOT throw when input is null and minify is false', function() {
    const inputs = [null, false, void 0];
    inputs.forEach(input => {
      expect(() => minify(input, {minify: false})).toNotThrow();
    });
  });

  describe('minify-options', function() {
    const optionsPluginsMap = {
      mangle: ['babel-plugin-transform-mangle'],
      dead_code: ['babel-plugin-transform-dead-code-elimination'],
      conditionals: ['babel-plugin-conditional-compile'],
      evaluate: ['babel-plugin-transform-evaluate'],
      drop_debugger: ['babel-plugin-transform-remove-debugger'],
      drop_console: ['babel-plugin-transform-remove-console'],
      properties: ['babel-plugin-transform-member-expression-literals', 'babel-plugin-transform-property-literals'],
      join_vars: ['babel-plugin-transform-merge-sibling-variables'],
      booleans: ['babel-plugin-transform-minify-booleans'],
      unsafe: ['babel-plugin-transform-undefined-to-void', 'babel-plugin-transform-simplify-comparison-operators'],
    };

    function flattenPlugin(p) {
      if (Array.isArray(p)) return p[0];
      return p;
    }
    function getPlugin(name) {
      let plugin = require(name);
      if (plugin.__esModule) return plugin.default;
      return plugin;
    }

    Object.keys(optionsPluginsMap).map(option => {
      it (`should enable/disable corresponding plugins for option = ${option}`, function() {
        const expected = optionsPluginsMap[option].map(name => getPlugin(name));

        const actualEnabled = minify(null, {
          minify: false,
          [option]: true
        }).plugins.map(plugin => flattenPlugin(plugin));

        const actualDisabled = minify(null, {
          minify: false,
          [option]: false
        }).plugins.map(plugin => flattenPlugin(plugin));

        expected.forEach(e => {
          expect(actualEnabled).toInclude(e);
          expect(actualDisabled).toExclude(e);
        });
      });
    });
  });
});
