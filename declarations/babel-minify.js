import type {Plugin, Preset} from 'Babel';

declare type MinifierOptions = {
  mangle: bool | MangleOptions,
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
  global_defs: Object,
  passes: number,
  babelrc: bool,
  plugins: Plugin[],
  presets: Preset[],
  minify: bool,
}

declare type MangleOptions = {
  topLevel: bool,
  eval: bool,
  except: [string|Object|function],
  keep_fnames: bool,
}

declare type ManglePluginOptions = {
  opts: MangleOptions
}

declare type MinifierResult = {
  plugins: Plugin[],
  presets: Preset[]
}

declare type MinifierOutput = string | MinifierResult

declare type GlobalDefsOptions = {
  opts: {
    global_defs: Object,
  }
}

declare type FunctionToArrowOptions = {
  opts: {
    keep_fnames: boolean,
  }
}

declare type CliRunnerOptions = {
  logger: {
    log: function,
    error: function,
    warn: function,
  }
}

declare type CliTaskResult = {
  contents: string,
  filename: string
}
