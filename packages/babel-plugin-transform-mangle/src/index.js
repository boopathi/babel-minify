import nameGenerator from './nameGenerator';

function renameIdentifiers(path) {
  const bindings = path.scope.getAllBindings();
  const ownBindings = Object.keys(bindings).filter(b => path.scope.hasOwnBinding(b));
  const names = nameGenerator();

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
