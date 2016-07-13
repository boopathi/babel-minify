// @flow
/*::import type {NodePath, Binding, Scope, Node, PluginOptions, Types} from 'Babel';*/
import extractVars from './extract-vars';

export default function replaceWith(to /*:string*/, path /*:NodePath*/, t /*:Types*/) {
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
  const decl = extractVars(removeBlock, t);
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
