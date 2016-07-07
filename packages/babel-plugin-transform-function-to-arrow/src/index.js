// @flow
/*::import type {NodePath, Binding, Scope, Node, PluginOptions} from 'Babel';*/

/**
 * For a particular path - Function Expression,
 * returns if that path is replacable to an arrow expression
 */
function isReplacable(path, keep_fnames) {
  if (keep_fnames && path.get('id').node) return false;
  let replacable = true;

  /**
   * If the function either uses this or arguments inside the function,
   * then it's NOT replacable
   */
  path.traverse({
    ThisExpression() {
      replacable = false;
    },
    Identifier(idPath /*:NodePath*/) {
      if (idPath.node.name === 'arguments')
        replacable = false;
    }
  });
  return replacable;
}

/**
 * Find if the block of an arrow function can be removed
 *
 * We test if the arrow contains a single return statement
 * var a = () => { return x };
 * var a = () => x;
 */
function isArrowReplacable(path) {
  let body = path.get('body');
  if ( body.isBlockStatement()
    && body.node.body.length === 1
    && body.node.body[0].type === "ReturnStatement")
    return true;
}

export default function ({types: t} /*:PluginOptions*/) {
  return {
    visitor: {
      FunctionExpression(path /*:NodePath*/, {
        opts: {
          keep_fnames = false
        } = {}
      } /*:FunctionToArrowOptions*/ = {}) {
        if (isReplacable(path, keep_fnames)) {
          path.replaceWith(
            t.arrowFunctionExpression(
              path.node.params, path.node.body
            )
          );
        }
      },
      ArrowFunctionExpression: {
        exit(path /*:NodePath*/) {
          if (isArrowReplacable(path)) {
            var body = path.get('body');
            body.replaceWith(
              body.node.body[0].argument
            );
          }
        }
      }
    }
  };
}
