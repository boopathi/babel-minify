// @flow
/*::import type {NodePath, Binding, Scope, Node, PluginOptions} from 'Babel';*/
export default function Evaluate({types: t} /*:PluginOptions*/) {
  return {
    visitor: {
      'BinaryExpression|LogicalExpression': {
        exit(path /*:NodePath*/) {
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
                const binding = path.scope.getBinding(init.node.name);
                if (!binding || binding.hasDeoptedValue) {
                  deopt()
                }
              } else {
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
      },

      AssignmentExpression(path /*:NodePath*/) {
        const left = path.get('left');
        if (!left.isIdentifier()) return;

        const binding = path.scope.getBinding(left.node.name);
        if (!binding || binding.hasDeoptedValue) return;

        const evaluated = path.get('right').evaluate();
        if (evaluated.confident) {
          binding.setValue(evaluated.value);
        } else {
          binding.deoptValue();
        }
      },

      Scopable: {
        enter(path /*:NodePath*/) {
          for (let name in path.scope.bindings) {
            const binding = path.scope.bindings[name];

            if (binding.constantViolations.length > 0) {
              binding.deoptValue();
            }
          }
        },
        exit(path /*:NodePath*/) {
          for (let name in path.scope.bindings) {
            const binding = path.scope.bindings[name];
            binding.clearValue();
          }
        }
      }
    }
  };
}
