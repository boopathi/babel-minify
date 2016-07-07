// @flow
/*::import type {NodePath, Binding, Scope, Node, PluginOptions} from 'Babel';*/
export default function Conditionals({types: t} /*:PluginOptions*/) {
  return {
    visitor: {
      Conditional(path /* :NodePath */) {
        const evaluated = path.get('test').evaluate();
        if (!evaluated.confident) {
          return path.skip();
        }
        if (evaluated.value) {
          replaceWith('consequent');
        } else {
          replaceWith('alternate');
        }

        function replaceWith(to /*:string*/) {
          /**
           * The block that is to be removed
           */
          const remove = to === 'consequent' ? 'alternate' : 'consequent';
          const replacements /*:Node[]*/ = [];

          const toBlock /*:NodePath*/ = path.get(to);
          const removeBlock /*:NodePath*/ = path.get(remove);

          if (toBlock.isBlockStatement()) {
            /**
             * if (0) {
             *   // removeBlock
             * } else {
             *   // toBlock - BlockStatement
             * }
             */
            if (Object.keys(toBlock.scope.bindings).length > 0) {
              /**
               * If the success block contains some bindings on its own
               * using let or const, then keep the block as it is
               *
               * if (1) {
               *   let x = 1;
               * }
               * out =>
               * {
               *   let x = 1;
               * }
               */
              replacements.push(toBlock.node);
            } else {
              /**
               * Else just put every statement in the replacement, and
               * the placing them within a block is unnecessary
               *
               * if (1) {
               *   doThis();
               *   doThat();
               * }
               * out =>
               * doThis();
               * doThat();
               */
              toBlock.node.body.forEach(e => replacements.push(e));
            }
          } else if (toBlock.isVariableDeclaration() || toBlock.node !== null) {
            /**
             * If it's either a variable declaration or it's just some statement,
             * there is no need for CREATING a new block statement, just pass it along
             *
             * in  => if (1) var x = 5;
             * out => var x = 5;
             * in  => if (1) doSomething();
             * out => doSomething();
             */
            replacements.push(toBlock.node);
          }

          /**
           * Capture other declarations.
           * Check the definition of dontForgetAlternate
           *
           * in  => if (0) var x = blahBlah();
           * out => var x;
           */
          const decl = dontForgetAlternate(removeBlock, t);
          if (decl) {
            /**
             * Here we decide whether to push it to the front or back
             *
             * in  => if (0) { var x = 5 } else { var y = 10 }
             * out => var x; var y = 10;
             *
             * in  => if (1) { var x = 5 } else { var y = 10 }
             * out => var x = 5; var y;
             */
            if (to === 'alternate') {
              replacements.unshift(decl);
            } else {
              replacements.push(decl);
            }
          }

          /**
           * And finally, replace the conditional with whatever we've collected
           */
          path.replaceWithMultiple(replacements);
        }
      }
    }
  };
}

function getVars(blockPath /*:NodePath*/) /*:NodePath[]*/ {
  /**
   * Get all Variable Declarations of kind 'var'
   * with the same function scope
   */
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

/**
 * We get all the variable declarations in the same scope,
 * and we take only the declartion WITHOUT the value outside
 * the block statement
 *
 * TODO:
 * needs a better function name
 */
function dontForgetAlternate(blockPath /*:NodePath*/, t /*:Object*/) /*:Node|null*/ {
  const declarators = [];

  if (blockPath.node === null) return null;

  /**
   * TODO:
   * Warn about constantViolations
   */

  getVars(blockPath).forEach(decl => {
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
