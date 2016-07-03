// @flow
/*::import type {NodePath, Binding, Scope, Node, PluginOptions} from 'Babel';*/
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
    keep_fnames = false
  } = {}
} /*:ManglerOptions*/ = {}) {
  const bindings /* :Object */ = path.scope.getAllBindings();

  const ownBindings /* :string[] */ = Object.keys(bindings).filter(b => path.scope.hasOwnBinding(b));
  const names = nameGenerator();

  ownBindings
    /**
     * If the binding is already just 1 character long,
     * there is no point in mangling - also, this saves us from expiring the
     * single character names during multiple passes.
     */
    .filter(b => b.length !== 1)
    /**
     * keep_fnames
     * This is useful for functions which depend on fn.name
     */
    .filter(b => {
      if (!keep_fnames) return true;
      const binding = path.scope.getBinding(b);
      if (!binding) {
        throw new TypeError('[mangle] Unexpected error. Binding not found');
      }
      return !isFunction(binding);
    })
    /**
     * Iterate through the possible names one by one until we
     * find a suitable binding that doesn't conflict with existing ones
     */
    .map(b => {
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
      Program(path /*:NodePath*/, options /*:ManglerOptions*/) {
        if (options.opts && options.opts.mangle_globals)
          renameIdentifiers(path, options);
      },
      BlockStatement: renameIdentifiers
    }
  };
}
