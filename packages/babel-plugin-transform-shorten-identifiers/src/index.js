function* atoz() {
  yield* 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
}

function* NameGenerator() {
  let i = 0;
  while (true) {
    if (i) for (let j of atoz()) yield j+i;
    else yield* atoz();
    i++;
  }
}

function renameIdentifiers(path) {
  const bindings = path.scope.getAllBindings();
  const ownBindings = Object.keys(bindings).filter(b => path.scope.hasOwnBinding(b));
  const names = NameGenerator();

  ownBindings.map(b => {
    path.scope.rename(b, names.next().value);
  });
}

export default function BabelPluginShortIdentifiers() {
  return {
    visitor: {
      Program: renameIdentifiers,
      BlockStatement: renameIdentifiers
    }
  };
}
