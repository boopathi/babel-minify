export default function Evaluate({types: t}) {
  return {
    visitor: {
      'BinaryExpression|LogicalExpression': {
        exit(path) {
          function isDeopt(id) {
            if (!id.isIdentifier()) return false;
            return path.scope.getBinding(id.node.name).hasDeoptedValue;
          }

          if (isDeopt(path.get('left'))) return;
          if (isDeopt(path.get('right'))) return;

          const evaluated = path.evaluate();
          if (evaluated.confident) path.replaceWith(t.valueToNode(evaluated.value));
        }
      },

      CallExpression: {
        exit(path) {
          const evaluated = path.evaluate();
          if (evaluated.confident) path.replaceWith(t.valueToNode(evaluated.value));
        }
      },

      VariableDeclaration: {
        enter(path) {
          path.get('declarations').forEach(decl => {
            const init = decl.get('init');
            const id = decl.get('id');
            const idBinding = path.scope.getBinding(id.node.name);
            if (init) {
              if (init.isIdentifier()) {
                const binding = path.scope.getBinding(init.node.name);
                if (!binding || binding.hasDeoptedValue) {
                  idBinding.deoptValue();
                }
              } else {
                init.traverse({
                  Identifier(idPath) {
                    const binding = path.scope.getBinding(idPath.node.name);
                    if (!binding || binding.hasDeoptedValue) {
                      idBinding.deoptValue();
                    }
                  }
                });
              }
            }
          });
        },
        exit(path) {
          path.get('declarations').forEach(decl => {
            const init = decl.get('init');
            if (init && init.isIdentifier()) {
              if (path.scope.getBinding(init.node.name).hasDeoptedValue) return;
              const evaluated = init.evaluate();
              if (evaluated.confident) {
                init.replaceWith(t.valueToNode(evaluated.value));
              }
            }
          });
        }
      },

      AssignmentExpression(path) {
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
        enter(path) {
          for (let name in path.scope.bindings) {
            const binding = path.scope.bindings[name];

            if (binding.constantViolations.length > 0) {
              binding.deoptValue();
            }
          }
        },
        exit(path) {
          for (let name in path.scope.bindings) {
            const binding = path.scope.bindings[name];
            binding.clearValue();
          }
        }
      }
    }
  };
}
