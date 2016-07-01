import nameGenerator from './namegen';

/**
 *
 * These entities can have a `name` property which should be preserved when
 * `keep_fnames` is true.
 *
 * Arrow functions don't have a name.
 *
 * Methods are anyway not renamed as they are object properties
 *
 */
function isFunction(binding) {
  return binding.path.isFunctionExpression() ||
    binding.path.isFunctionDeclaration() ||
    binding.path.isClassDeclaration() ||
    binding.path.isClassExpression();
}

function renameIdentifiers(path, {
  opts: {
    keep_fnames = false,
    mangle_globals = false
  } = {}
} = {}) {
  const bindings = path.scope.getAllBindings();
  const ownBindings = Object.keys(bindings).filter(b => path.scope.hasOwnBinding(b));
  const names = nameGenerator();

  ownBindings.filter(b => {
    const binding = path.scope.getBinding(b);

    if (!mangle_globals) {
      const functionParent = binding.scope.getFunctionParent();
      const programParent = binding.scope.getProgramParent();

      /**
       * Function declarations inside Program -> Block are hoisted within the
       * block, but are available outside the block, for example
       *
       * if (true) {
       *   function a() {}
       * }
       * a() // is available here and should be treated as global
       *     // and should not be mangled
       */
      if (binding.path.isFunctionDeclaration() && functionParent === programParent) {
        return false;
      }
    }

    if (!keep_fnames) return true;

    return !isFunction(binding);
  }).map(b => {
    /**
     * Iterate through the possible names one by one until we
     * find a suitable binding that doesn't conflict with existing ones
     */
    let next = names.next().value;
    while (path.scope.hasBinding(next) || path.scope.hasGlobal(next) || path.scope.hasReference(next)) {
      next = names.next().value;
    }
    path.scope.rename(b, next);
  });
}

export default function Mangle() {
  return {
    visitor: {
      Program(path, options) {
        if (options.opts && options.opts.mangle_globals)
          renameIdentifiers(path, options);
      },
      BlockStatement: renameIdentifiers
    }
  };
}
