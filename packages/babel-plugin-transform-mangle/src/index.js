// @flow
/*::import type {NodePath, Binding, Scope, Node, PluginOptions} from 'Babel';*/
import nameGenerator from './namegen';

/**
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

/**
 * Eval works in a way that, anything inside eval can access
 * all variables in ALL of its parent scopes
 *
 * Also, eval cannot be changed in strict mode like - let eval = 0;
 * So we don't have to find the data flow from the eval() expression
 *
 * We traverse through the path and detect any usage of eval
 */
function isEval(path) {
  let isEval = false;

  path.traverse({
    CallExpression(evalPath) {
      const callee = evalPath.get('callee');
      if (callee.isIdentifier() && callee.node.name === 'eval') {
        isEval = true;
      }
    }
  });

  return isEval;
}

/**
 * Given the predicates, filter the Exceptions from getting mangled
 * Mangle option: except
 */
function isExcept(binding /*:string*/, except /*:any[]*/) /*:bool*/ {
  for (let i = 0; i < except.length; i++) {
    const predicate = except[i];

    switch (typeof predicate) {
      case 'string':
        if (predicate === binding) return true;
        break;

      case 'function':
        if (predicate(binding)) return true;
        break;

      // For regular expressions
      case 'object':
        if (predicate.test(binding)) return true;
        break;
    }
  }
  return false;
}

function renameIdentifiers(path /* :NodePath */, {
  opts: {
    keep_fnames = false,
    eval: _eval = false,
    except      = [],
  } = {}
} /*:ManglePluginOptions*/ = {}) {
  /**
   * Handle eval()
   *
   * If _eval is enabled/true, then we can mangle the names
   * If _eval is disabled/false, then we should check for eval in sub paths
   *
   * new Function() works in a way such that it is restricted
   * to access only it's variables declared in the local scope
   * and the variables in the global scope
   *
   * OR
   *
   * the function is created in the global scope
   *
   * So, we don't have to worry about handling them here
   */
  if (!_eval && isEval(path)) return;

  const bindings /* :Object */ = path.scope.getAllBindings();

  const ownBindings /* :string[] */ = Object.keys(bindings).filter(b => path.scope.hasOwnBinding(b));
  const names = nameGenerator();

  ownBindings
    /**
     * Filter all except passed in from the user
     * Don't mangle them
     */
    .filter(b => !isExcept(b, except))
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
      Program(path /*:NodePath*/, options /*:ManglePluginOptions*/) {
        if (options.opts && options.opts.topLevel) {
          let isNewFn = false;

          path.traverse({
            NewExpression(newPath) {
              const callee = newPath.get('callee');
              if (callee.isIdentifier() && callee.node.name === 'Function') {
                isNewFn = true;
              }
            }
          });

          if (!isNewFn) {
            renameIdentifiers(path, options);
          }
        }
      },
      BlockStatement: renameIdentifiers
    }
  };
}
