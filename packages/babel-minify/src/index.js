import {transform} from 'babel-core';

// plugins
import manglePlugin                from 'babel-plugin-transform-mangle';
import evaluatePlugin              from 'babel-plugin-transform-evaluate';
import conditionalCompile          from 'babel-plugin-conditional-compile';
import removeDebugger              from 'babel-plugin-transform-remove-debugger';
import removeConsole               from 'babel-plugin-transform-remove-console';
import deadCodeElimination         from 'babel-plugin-transform-dead-code-elimination';
import memberExpressionLiterals    from 'babel-plugin-transform-member-expression-literals';
import mergeSiblingVariables       from 'babel-plugin-transform-merge-sibling-variables';
import minifyBooleans              from 'babel-plugin-transform-minify-booleans';
import propertyLiterals            from 'babel-plugin-transform-property-literals';
import simplifyComparisonOperators from 'babel-plugin-transform-simplify-comparison-operators';
import undefinedToVoid             from 'babel-plugin-transform-undefined-to-void';

export default function BabelMinify(inputCode, {
  mangle        = true,

  dead_code     = false,
  conditionals  = true,
  global_defs   = {},
  evaluate      = true, // eval constant expressions
  drop_debugger = false,
  drop_console  = false,
  properties    = true,
  join_vars     = true,
  booleans      = true,
  unsafe        = true,
  keep_fnames   = false,

  // passed on to babel transform to tell whether to use babelrc
  babelrc       = false,

  // should there by any other plugins added to this build process
  plugins       = [],

  // if false, babel-minify can give a list of plugins to use as a preset
  minify        = true,
} = {}) {

  if (typeof inputCode !== 'string' && minify) throw new Error('Invalid Input');

  const minifyPlugins = [];

  if (mangle) {
    if (keep_fnames) minifyPlugins.push([manglePlugin, { keep_fnames }]);
    else minifyPlugins.push(manglePlugin);
  }

  dead_code     && minifyPlugins.push(deadCodeElimination);
  evaluate      && minifyPlugins.push(evaluatePlugin);
  drop_debugger && minifyPlugins.push(removeDebugger);
  drop_console  && minifyPlugins.push(removeConsole);
  properties    && minifyPlugins.push(memberExpressionLiterals);
  properties    && minifyPlugins.push(propertyLiterals);
  join_vars     && minifyPlugins.push(mergeSiblingVariables);
  booleans      && minifyPlugins.push(minifyBooleans);
  unsafe        && minifyPlugins.push(undefinedToVoid);
  unsafe        && minifyPlugins.push(simplifyComparisonOperators);

  if (conditionals) {
    if (global_defs) {
      minifyPlugins.push([conditionalCompile, {
        define: global_defs
      }]);
    } else {
      minifyPlugins.push(conditionalCompile);
    }
  }

  const finalPluginsList = [].concat(
    minifyPlugins,
    plugins
  );

  // if minify is false, return the plugins list to be used elsewhere
  // maybe move this to a separate file later
  if (!minify) return { plugins: finalPluginsList };

  const result = transform(inputCode, {
    babelrc,
    comments: false,
    compact: true,
    minified: true,
    plugins: finalPluginsList
  });

  return result.code;
}
