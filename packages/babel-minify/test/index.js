import minify from '../';

describe('babel-minify', function() {
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
      conditionals: ['babel-plugin-transform-conditionals'],
      evaluate: ['babel-plugin-transform-evaluate'],
      drop_debugger: ['babel-plugin-transform-remove-debugger'],
      drop_console: ['babel-plugin-transform-remove-console'],
      properties: [
        'babel-plugin-transform-member-expression-literals',
        'babel-plugin-transform-property-literals'
      ],
      join_vars: ['babel-plugin-transform-merge-sibling-variables'],
      booleans: ['babel-plugin-transform-minify-booleans'],
      unsafe: [
        'babel-plugin-transform-undefined-to-void',
        'babel-plugin-transform-simplify-comparison-operators',
        'babel-plugin-transform-function-to-arrow'
      ]
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
    function getActualPlugins(option, enabled) {
      const actualPluginsAndPresets = minify(null, {
        minify: false,
        [option]: enabled
      });
      const plugins = actualPluginsAndPresets.plugins.map(p => flattenPlugin(p));

      actualPluginsAndPresets.presets.forEach(preset => {
        preset.plugins.map(p => flattenPlugin(p)).forEach(plugin => {
          plugins.push(plugin);
        });
      });
      return plugins;
    }

    Object.keys(optionsPluginsMap).map(option => {
      it (`should enable/disable corresponding plugins for option = ${option}`, function() {
        const expected = optionsPluginsMap[option].map(name => getPlugin(name));

        const actualEnabled = getActualPlugins(option, true);

        const actualDisabled = getActualPlugins(option, false);

        expected.forEach(e => {
          expect(actualEnabled).toInclude(e);
          expect(actualDisabled).toExclude(e);
        });
      });
    });
  });
});
