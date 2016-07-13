// @flow
/*::import type {NodePath, Binding, Scope, Node, PluginOptions} from 'Babel';*/
export default function Evaluate({types: t} /*:PluginOptions*/) {
  return {
    visitor: {
      'BinaryExpression|LogicalExpression': {
        exit(path /*:NodePath*/) {
          /**
           * Tells whether a binding is deopted
           * var x = 5; if (a) { var x = 6 }
           * var x = 1; if (b) { x = 0 }
           */
          function isDeopt(id) {
            if (!id.isIdentifier()) return false;
            const binding = path.scope.getBinding(id.node.name);
            return !binding || binding.hasDeoptedValue;
          }

          if (isDeopt(path.get('left'))) return;
          if (isDeopt(path.get('right'))) return;

          const evaluated = path.evaluate();
          if (evaluated.confident) path.replaceWith(t.valueToNode(evaluated.value));
        }
      },

      CallExpression: {
        exit(path /*:NodePath*/) {
          const evaluated = path.evaluate();
          if (evaluated.confident) path.replaceWith(t.valueToNode(evaluated.value));
        }
      },

      VariableDeclaration: {
        enter(path /*:NodePath*/) {
          /**
           * We are using this hook to deopt variable re-declarations
           *
           * Babel (<6.10) has a bug that it doesn't deopt variable re-declarations,
           * so, we do that here.
           *
           * https://github.com/babel/babel/pull/3559
           * https://phabricator.babeljs.io/T7470
           */
          path.get('declarations').forEach(decl => {
            const init = decl.get('init');
            const idBindings = decl.getBindingIdentifiers();

            function deopt () {
              Object.keys(idBindings).forEach(id => {
                const binding = path.scope.getBinding(id);
                if (binding) binding.deoptValue();
              });
            }

            if (init) {
              if (init.isIdentifier()) {
                /**
                 * var x = a; // a is a deopted value, deopt x
                 */
                const binding = path.scope.getBinding(init.node.name);
                if (!binding || binding.hasDeoptedValue) {
                  deopt()
                }
              } else {
                /**
                 * var x = a + b; // b is a deopted value, deopt x
                 */
                init.traverse({
                  Identifier(idPath) {
                    const binding = path.scope.getBinding(idPath.node.name);
                    if (!binding || binding.hasDeoptedValue) {
                      deopt();
                    }
                  }
                });
              }
            }
          });
        },
        exit(path /*:NodePath*/) {
          /**
           * This space is for evaluating the right side of the
           * variable declaration
           */
          path.get('declarations').forEach(decl => {
            const init = decl.get('init');
            if (init && init.isIdentifier()) {
              const binding = path.scope.getBinding(init.node.name);
              if (!binding || binding.hasDeoptedValue) return;
              const evaluated = init.evaluate();
              if (evaluated.confident) {
                init.replaceWith(t.valueToNode(evaluated.value));
              }
            }
          });
        }
      }
    }
  };
}
