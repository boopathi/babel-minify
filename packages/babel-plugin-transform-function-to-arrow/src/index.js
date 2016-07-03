// @flow
/*::import type {NodePath, Binding, Scope, Node, PluginOptions} from 'Babel';*/
function isReplacable(path) {
  if (typeof path.get('name').node !== 'undefined') return false;
  let replacable = true;
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
      FunctionExpression(path /*:NodePath*/) {
        if (isReplacable(path)) {
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
