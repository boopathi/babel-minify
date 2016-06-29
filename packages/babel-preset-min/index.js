const pluginsAndPresets = require('babel-minify')(null, { minify: false });

let plugins = [...pluginsAndPresets.plugins];

pluginsAndPresets.presets.forEach(preset => {
  plugins = [...plugins, ...preset.plugins];
});

module.exports = { plugins };
