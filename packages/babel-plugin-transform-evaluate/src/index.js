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

      Conditional: function Conditional(path) {
        const evaluated = path.get('test').evaluate();
        if (!evaluated.confident) {
          return path.skip();
        }
        if (evaluated.value) {
          replaceWith('consequent');
        } else {
          replaceWith('alternate');
        }

        function getVars(blockPath) {
          const declarations = [];
          if (blockPath.isBlockStatement()) {
            const blockFnScope = blockPath.getFunctionParent();
            blockPath.traverse({
              VariableDeclaration: function VariableDeclaration(varPath) {
                if (varPath.isVariableDeclaration({kind:'var'}) && varPath.getFunctionParent() === blockFnScope) {
                  declarations.push(varPath);
                }
              }
            });
          } else if (blockPath.isVariableDeclaration({ kind: 'var' })) {
            declarations.push(blockPath);
          }
          return declarations;
        }

        // needs a better function name
        function dontForgetAlternate(blockPath) {
          const declarators = [];

          getVars(blockPath).forEach(decl => {
            decl.get('declarations').forEach(dr => {
              declarators.push(t.variableDeclarator(dr.node.id));
            });
          });

          if (declarators.length <= 0) return null;
          return t.variableDeclaration('var', declarators);
        }

        function replaceWith(to) {
          const remove = to === 'consequent' ? 'alternate' : 'consequent';
          const replacements = [];

          const toBlock = path.get(to);
          const removeBlock = path.get(remove);

          const decl = dontForgetAlternate(removeBlock);
          if (decl) replacements.push(t.BlockStatement([decl]));

          if (toBlock.isBlockStatement()) {
            if (Object.keys(toBlock.scope.bindings).length > 0 || getVars(toBlock).length > 0) {
              replacements.push(toBlock.node);
            } else {
              toBlock.node.body.forEach(e => replacements.push(e));
            }
          } else if (toBlock.isVariableDeclaration()) {
            replacements.push(t.BlockStatement([toBlock.node]));
          } else if (toBlock.node !== null) {
            replacements.push(toBlock.node);
          }
          path.replaceWithMultiple(replacements);
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
