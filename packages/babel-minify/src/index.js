import {transform} from 'babel-core';
import minPreset from 'babel-preset-min';

const defaultPlugins = minPreset.plugins;

// other plugins
import conditionalCompile from 'babel-plugin-conditional-compile';
import removeDebugger from 'babel-plugin-transform-remove-debugger';
import removeConsole from 'babel-plugin-transform-remove-console';

const DEV = process.env.NODE_ENV !== 'production';
const PROD = !DEV;

export default function BabelMinify(inputCode, {
  // optimize if-s
  conditionals = true,

  global_defs = {
    DEV,
    PROD,
    __DEV__: DEV,
    __PROD__: PROD
  },

  drop_debugger = false,
  drop_console = false,

  // passed on to babel transform to tell whether to use babelrc
  babelrc = false,
} = {}) {

  if (!inputCode) throw new Error('Invalid Input');

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

  const result = transform(inputCode, {
    babelrc,
    comments: false,
    compact: true,
    minified: true,
    plugins: [].concat(defaultPlugins, optionalPlugins)
  });

  return result.code;
}
