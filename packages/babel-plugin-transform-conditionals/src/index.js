export default function Conditionals({types: t}) {
  return {
    visitor: {
      Conditional(path) {
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
            blockPath.traverse({
              VariableDeclaration(varPath) {
                if (varPath.isVariableDeclaration({ kind:'var' }) && varPath.getFunctionParent() === blockPath.getFunctionParent()) {
                  declarations.push(varPath);
                }
              },
              FunctionDeclaration(varPath) {
                declarations.push(varPath);
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

          if (blockPath.node === null) return null;

          /**
           * TODO:
           * Warn about constantViolations
           */

          getVars(blockPath).forEach(decl => {
            const bindingIdentifiers = decl.getBindingIdentifiers();
            Object.keys(bindingIdentifiers).forEach(id => {
              let alreadyFound = false;
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
          return t.variableDeclaration('var', declarators);
        }

        function replaceWith(to) {
          const remove = to === 'consequent' ? 'alternate' : 'consequent';
          const replacements = [];

          const toBlock = path.get(to);
          const removeBlock = path.get(remove);

          if (toBlock.isBlockStatement()) {
            if (Object.keys(toBlock.scope.bindings).length > 0) {
              replacements.push(toBlock.node);
            } else {
              toBlock.node.body.forEach(e => replacements.push(e));
            }
          } else if (toBlock.isVariableDeclaration() || toBlock.node !== null) {
            replacements.push(toBlock.node);
          }

          const decl = dontForgetAlternate(removeBlock);
          if (decl) {
            if (to === 'alternate') {
              replacements.unshift(decl);
            } else {
              replacements.push(decl);
            }
          }

          path.replaceWithMultiple(replacements);
        }
      }
    }
  };
}
