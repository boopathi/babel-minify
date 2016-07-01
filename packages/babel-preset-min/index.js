// @flow
const pluginsAndPresets /*:MinifierResult*/ = require('babel-minify')(null, { minify: false });

let plugins = [].concat(pluginsAndPresets.plugins);

pluginsAndPresets.presets.forEach(preset => {
  plugins = [...plugins, ...preset.plugins];
});

module.exports = { plugins };
