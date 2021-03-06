// @flow
const D /*:MinifierOptions*/ = {
  mangle          : true,

  dead_code       : false,
  conditionals    : true,
  evaluate        : true,
  drop_debugger   : false,
  drop_console    : false,
  properties      : true,
  join_vars       : true,
  booleans        : true,
  unsafe          : true,
  keep_fnames     : false,

  // global-defs
  global_defs     : {},

  // source maps
  sourceMaps      : false,

  // input sourcemap
  inputSourceMap  : null,

  // number of passes
  passes          : 1,

  // passed on to babel transform to tell whether to use babelrc
  babelrc         : false,

  // should there be any other plugins added to this build process
  plugins         : [],

  // should there be any other presets
  presets         : [],

  // if false, babel-minify can give a list of plugins to use as a preset
  minify          : true,
};

export default D;

export const mangleDefaults /*:MangleOptions*/ = {
  keep_fnames     : false,
  eval            : false,
  except          : [],
  topLevel        : false,
}
