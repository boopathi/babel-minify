export default function({types: t}) {
  return {
    visitor: {
      'BinaryExpression|LogicalExpression|CallExpression': {
        exit(path) {
          const evaluated = path.evaluate();
          if (evaluated.confident) path.replaceWith(t.valueToNode(evaluated.value));
        }
      },
      AssignmentExpression(path) {
        const left = path.get('left');
        if (!left.isIdentifier()) return;

        const binding = path.scope.getBinding(left.node.name);
        if (!binding && binding.hasDeoptedValue) return;

        const evaluated = path.get('right').evaluate();
        if (evaluated.confident) {
          binding.setValue(evaluated.value);
        } else {
          binding.deoptValue();
        }
      },
      Conditional(path) {
        const evaluated = path.get('test').evaluate();
        if (!evaluated.confident) {
          return path.skip();
        }

        function replaceWith(to) {
          const toStatement = path.get(to);
          if (!toStatement.isBlockStatement()) {
            return path.replaceWith(toStatement);
          }
          if (Object.keys(toStatement.scope.bindings).length > 0) {
            return path.replaceWith(toStatement);
          }
          path.replaceWithMultiple(toStatement.node.body);
        }

        if (evaluated.value) {
          replaceWith('consequent');
        } else {
          replaceWith('alternate');
        }
      },
      Scopable: {
        enter(path) {
          const funcScope = path.scope.getFunctionParent();
          for (let name in path.scope.bindings) {
            const binding = path.scope.bindings[name];
            let deopt = false;

            for (let violatePath of binding.constantViolations) {
              const funcViolationScope = violatePath.scope.getFunctionParent();

              if (funcScope !== funcViolationScope) {
                deopt = true;
                break;
              }
            }

            if (deopt) binding.deoptValue();
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
