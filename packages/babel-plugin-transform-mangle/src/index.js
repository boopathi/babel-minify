import nameGenerator from './namegen';

function renameIdentifiers(path) {
  const bindings = path.scope.getAllBindings();
  const ownBindings = Object.keys(bindings).filter(b => path.scope.hasOwnBinding(b));
  const names = nameGenerator();

  ownBindings.map(b => {
    let next = names.next().value;
    while (path.scope.hasBinding(next)) {
      next = names.next().value;
    }
    path.scope.rename(b, next);
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
