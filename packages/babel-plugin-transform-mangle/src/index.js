import nameGenerator from './namegen';

function isFunction(binding) {
  return binding.path.isFunctionExpression() ||
    binding.path.isFunctionDeclaration();
}

function renameIdentifiers(path, {
  opts: {
    keep_fnames = false
  } = {}
} = {}) {
  const bindings = path.scope.getAllBindings();
  const ownBindings = Object.keys(bindings).filter(b => path.scope.hasOwnBinding(b));
  const names = nameGenerator();

  ownBindings.filter(b => {
    if (!keep_fnames) return true;
    return !isFunction(path.scope.getBinding(b));
  }).map(b => {
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
