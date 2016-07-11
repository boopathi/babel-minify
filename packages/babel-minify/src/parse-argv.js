// @flow

export function removeUndefinedOptions(argv /*:MinifierArgv*/) {
  for (let key of Object.keys(argv)) {
    if (typeof argv[key] === 'undefined')
      delete argv[key];
  }
}

// will be added when that module is added
// export function parseGlobalDefs(argv /*:Argv*/) {
//   if (argv.global_defs) {
//     argv.global_defs = argv.globalDefs = argv['global-defs'] = Object.keys(argv.global_defs)
//       .map(def => def.split('='))
//       .reduce((p,c) => {
//         p[c[0]] = c[1];
//         return p;
//       }, {});
//   }
// }

export function parseArgv(argv /*:MinifierArgv*/, opts /*:MinifierCliRunOptions*/) {
  const parses = [
    removeUndefinedOptions
    // parseGlobalDefs
  ]
  parses.forEach(parse => parse(argv, opts));
}
