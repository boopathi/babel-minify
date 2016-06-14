export function removeUndefinedOptions(argv) {
  for (let key of Object.keys(argv)) {
    if (typeof argv[key] === 'undefined')
      delete argv[key];
  }
}

export function parseGlobalDefs(argv) {
  if (argv.global_defs) {
    argv.global_defs = argv.globalDefs = argv['global-defs'] = argv.global_defs
      .map(def => def.split('='))
      .reduce((p,c) => {
        p[c[0]] = c[1];
        return p;
      }, {});
  }
}

export function parseArgv(argv, opts) {
  const parses = [
    removeUndefinedOptions,
    parseGlobalDefs
  ]
  parses.forEach(parse => parse(argv, opts));
}
