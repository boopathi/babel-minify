import babel from 'babel-core';
import minPreset from 'babel-preset-min';

const defaultPlugins = minPreset.plugins;

// other plugins
import conditionalCompile from 'babel-plugin-conditional-compile';
import removeDebugger from 'babel-plugin-transform-remove-debugger';
import removeConsole from 'babel-plugin-transform-remove-console';

export default function BabelMinify({
  // optimize if-s
  conditionals = true,

  drop_debugger = false,
  drop_console = false,

  // passed on to babel transform to tell whether to use babelrc
  babelrc = false,
} = {}) {

  const optionalPlugins = [];

  if (conditionals) {
    if (global_defs) {
      optionalPlugins.push([conditionalCompile, {
        define: global_defs
      }]);
    } else {
      optionalPlugins.push(conditionalCompile);
    }
  }

  drop_debugger && optionalPlugins.push(removeDebugger);
  drop_console && optionalPlugins.push(removeConsole);

  const result = babel.transform(opts.code, {
    babelrc,
    comments: false,
    compact: true,
    minified: true,
    plugins: [].concat(defaultPlugins, optionalPlugins)
  });

  return result.code;
}
