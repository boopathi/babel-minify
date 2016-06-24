function isReplacable(path) {
  /**
   * If the FunctionExpression is not a part of a VariableDeclaration
   * then it's not safe to transform because there can be a binding
   * to the function in the place it is being used.
   */
  if (!path.parentPath.isVariableDeclarator()) return false;
  if (typeof path.get('name') !== 'undefined') return false;

  let replacable = true;
  path.traverse({
    ThisExpression(_) {
      replacable = false;
    },
    Identifier(idPath) {
      if (idPath.node.name === 'arguments')
        replacable = false;
    }
  });
  return replacable;
}

function isArrowReplacable(path) {
  let body = path.get('body');
  if ( body.isBlockStatement()
    && body.get('body').length === 1
    && body.get('body')[0].type === "ReturnStatement")
    return true;
}

export default function ({types: t}) {
  return {
    visitor: {
      FunctionExpression(path) {
        if (isReplacable(path)) {
          path.replaceWith(
            t.arrowFunctionExpression(
              path.node.params, path.node.body
            )
          );
        }
      },
      ArrowFunctionExpression(path) {
        if (isArrowReplacable(path)) {
          var body = path.get('body');
          body.replaceWith(
            body.node.body[0].argument
          );
        }
      }
    }
  };
}
