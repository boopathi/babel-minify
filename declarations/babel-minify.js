declare type MinifierOptions = {
  mangle: bool,
  mangle_globals: bool,
  dead_code: bool,
  conditionals: bool,
  evaluate: bool,
  drop_debugger: bool,
  drop_console: bool,
  properties: bool,
  join_vars: bool,
  booleans: bool,
  unsafe: bool,
  keep_fnames: bool,
  npasses: number,
  babelrc: bool,
  plugins: Plugin[],
  presets: Preset[],
  minify: bool,
}

declare type MinifierResult = {
  plugins: Plugin[],
  presets: Preset[]
}

declare type MinifierOutput = string | MinifierResult

declare type ManglerOptions = {
  opts: {
    keep_fnames: boolean,
    mangle_globals: boolean
  }
}
