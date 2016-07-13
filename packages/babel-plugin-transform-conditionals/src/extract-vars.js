// @flow
/*::import type {NodePath, Binding, Scope, Node, PluginOptions, Types} from 'Babel';*/

/**
 * We get all the variable declarations in the same scope,
 * and we take only the declartion WITHOUT the value outside
 * the block statement
 */
export default function extractVars(blockPath /*:NodePath*/, t /*:Types*/) /*:Node|null*/ {
  const declarators = [];

  if (blockPath.node === null) return null;

  /**
   * TODO:
   * Warn about constantViolations
   */

  extractDeclarators(blockPath).forEach(decl => {
    /**
     * Get the binding identifiers
     */
    const bindingIdentifiers = decl.getBindingIdentifiers();
    Object.keys(bindingIdentifiers).forEach(id => {
      let alreadyFound = false;

      /**
       * Eliminate re-declarations inside the block that'll be removed
       *
       * var x;
       * if (0) var x;
       */
      declarators.forEach(dl => {
        if (dl.id.name === id) {
          alreadyFound = true;
        }
      });
      if (!alreadyFound) {
        declarators.push(t.variableDeclarator(bindingIdentifiers[id]));
      }
    });
  });

  if (declarators.length <= 0) return null;

  /**
   * return whatever we have collected wrapped up in
   * a single variable declaration
   */
  return t.variableDeclaration('var', declarators);
}

/**
 * Get all Variable Declarations of kind 'var'
 * with the same function scope
 */
export function extractDeclarators(blockPath /*:NodePath*/) /*:NodePath[]*/ {
  const declarations = [];

  if (blockPath.isBlockStatement()) {
    /**
     * if (a) {
     *   var x; // capture this
     *   // functions are block scope
     *   // https://github.com/boopathi/babel-minify/issues/14
     *   function fn() {
     *     var x, y; // don't capture this
     *   }
     * }
     */
    blockPath.traverse({
      VariableDeclaration(varPath) {
        if (varPath.isVariableDeclaration({ kind:'var' })
          && varPath.scope.getFunctionParent() === blockPath.scope.getFunctionParent()) {
          declarations.push(varPath);
        }
      }
    });
  } else if (blockPath.isVariableDeclaration({ kind: 'var' })) {
    /**
     * if (a) var x;
     */
    declarations.push(blockPath);
  }
  return declarations;
}
