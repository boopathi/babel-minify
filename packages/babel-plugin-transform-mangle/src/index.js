// @flow
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
function isFunction(binding /* :Binding */) /*:boolean*/ {
  return binding.path.isFunctionExpression() ||
    binding.path.isFunctionDeclaration() ||
    binding.path.isClassDeclaration() ||
    binding.path.isClassExpression();
}

function renameIdentifiers(path /* :NodePath */, {
  opts: {
    keep_fnames = false,
    mangle_globals = false
  } = {}
} /*:ManglerOptions*/ = {}) {
  const bindings /* :Object */ = path.scope.getAllBindings();
  const ownBindings /* :string[] */ = Object.keys(bindings).filter(b => path.scope.hasOwnBinding(b));
  const names = nameGenerator();

  ownBindings.filter(b => {
    const binding /* :Binding */ = path.scope.getBinding(b);

    if (!mangle_globals) {
      const functionParent /* :Scope */ = binding.scope.getFunctionParent();
      const programParent /* :Scope */ = binding.scope.getProgramParent();

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
    let _next = names.next();
    if (_next.done) throw new Error('Name generator stopped');

    let next /*:string*/ = _next.value;
    while (path.scope.hasBinding(next) || path.scope.hasGlobal(next) || path.scope.hasReference(next)) {
      _next = names.next();
      if (_next.done) throw new Error('Name generator stopped');
      next = _next.value;
    }
    path.scope.rename(b, next);
  });
}

/**
 * Mangle Plugin
 */
export default function Mangle() {
  return {
    visitor: {
      Program(path /*:any*/, options /*:ManglerOptions*/) {
        if (options.opts && options.opts.mangle_globals)
          renameIdentifiers(path, options);
      },
      BlockStatement: renameIdentifiers
    }
  };
}
