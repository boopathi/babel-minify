// @flow
/*::import type {NodePath, Binding, Scope, Node, PluginOptions} from 'Babel';*/
export default function ({types: t} /*:PluginOptions*/) {
  let globalDefs /*:Object*/ = {};
  let deopts /*:string[]*/ = [];

  let _definitions /*:[[string, mixed]]*/ = [];
  let definitions /*:[{
    root:string,
    expr: string,
    value: mixed,
    allExpr: [string]
  }]*/= [];

  function deopt(expr /*:string*/) {
    // debug
    // console.log('deopting', expr);
    deopts.push(expr);
  }

  function isDeopt(expr /*:string*/) /*:bool*/{
    for (let i = 0; i < deopts.length; i++) {
      if (expr.indexOf(deopts[i]) !== -1) {
        return true;
      }
    }
    return false;
  }

  return {
    visitor: {
      Program(path /*:NodePath*/, {
        opts: {
          global_defs = {}
        } = {}
      } /*:GlobalDefsOptions*/ = {}) {
        // validate it's a plain object
        if (!global_defs || typeof global_defs !== 'object' || Array.isArray(global_defs)) {
          throw new Error('global_defs must be a Plain Object');
        }
        // validate that there are no circular references
        if (hasCircularReference(global_defs)) {
          throw new Error('global_defs has a circular referece');
        }

        globalDefs = global_defs;

        // !important
        // flush the deopts, otherwise it is preserved in memory
        deopts = [];

        _definitions = getAllPaths(globalDefs);
        definitions = _definitions.map(defn => {
          const root /*:string*/ = defn[0];
          const {expr, value} = getExpressionFromPath(defn);
          const allExpr = getAllExpressionsFromPath(defn);
          return {root, expr, value, allExpr};
        });
      },

      // TODO
      // UpdateExpression x++ things

      AssignmentExpression(path /*:NodePath*/) {
        const left = path.get('left');

        definitions.forEach(({root, allExpr}) => {
          allExpr.forEach(expr => {
            let match = false;

            if (left.isIdentifier()) {
              if (left.node.name === expr) {
                match = true;
              }
            } else if (left.isMemberExpression()) {
              if (left.matchesPattern(expr)) {
                match = true;
              }
            }

            // debug
            // if (match) {
            //   console.log(
            //     "AssignmentExpression",
            //     !path.scope.hasBinding(root),
            //     path.scope.hasGlobal(root),
            //     isDeopt(expr)
            //   );
            // }

            if (!path.scope.hasBinding(root)
              && path.scope.hasGlobal(root)
              && match
              && !isDeopt(expr)
            ) {
              deopt(expr);
            }
          });
        });
      },

      Identifier: {
        exit(path /*:NodePath*/) {

          // replaceable paths
          let replaceablePaths = [
            'BinaryExpression',
            'LogicalExpression',
            'ExpressionStatement',
            'Conditional',
            'SwitchStatement',
            'SwitchCase',
            'WhileStatement',
            'DoWhileStatement',
            'ForStatement'
          ];

          let replaceable = false;

          for (let i of replaceablePaths) {
            if (path.parentPath['is'+i]()) {
              replaceable = true;
            }
          }

          if (!replaceable) return;

          definitions.filter(({root, expr}) => root === expr)
            .forEach(({root, value}) => {
              if (!path.scope.hasBinding(root)
                && path.scope.hasGlobal(root)
                && !isDeopt(root)
              ) {
                path.replaceWith(t.valueToNode(value));
              }
            });
        }
      },

      MemberExpression: {
        exit(path /*:NodePath*/) {
          definitions.filter(({root, expr}) => root !== expr)
            .forEach(({root, expr, value}) => {
              // debug
              // if (path.matchesPattern(expr)) {
              //   console.log(
              //     !path.scope.hasBinding(root)
              //     , path.scope.hasGlobal(root)
              //     , !isDeopt(expr)
              //   );
              // }

              if (path.matchesPattern(expr)
                && !path.scope.hasBinding(root)
                && path.scope.hasGlobal(root)
                && !isDeopt(expr)
              ) {
                path.replaceWith(t.valueToNode(value));
              }
            });
        }
      }
    }
  }
}

function hasCircularReference(obj /*:Object*/) /*:bool*/ {
  let visited = [];
  function walk(o) {
    if (o && typeof o === 'object') {
      if (visited.indexOf(o) !== -1) {
        return true;
      }
      visited.push(o);
      for (let key in o) {
        if (Object.hasOwnProperty.call(o, key) && walk(o[key])) {
          // debug
          // console.log('CircularReference at ' + key);
          return true;
        }
      }
    }
    return false;
  }
  return walk(obj);
}

function getAllPaths(obj /*:Object*/) /*:[[string, mixed]] */ {
  let paths /*[[string, mixed]]*/ = [];
  function walk(o, state /*:[number|string]*/= []) {
    if (o && typeof o === 'object') {
      if (Array.isArray(o)) {
        for (let i = 0; i < o.length; i++) {
          walk(o[i], [...state, i]);
        }
      } else {
        for (let key in o) {
          if (Object.hasOwnProperty.call(o, key)) {
            walk(o[key], [...state, key]);
          }
        }
      }
    } else {
      paths.push([...state, o]);
    }
  }
  walk(obj);
  return paths;
}


function exprToString(expr /*:[string, mixed]*/) /*:string*/ {
  return expr.reduce((p, c) => {
    if (typeof c === 'number') {
      return  `${p}[${c}]`;
    } else if (typeof c === 'string') {
      return p ? p + '.' +c : c;
    } else {
      throw new TypeError('Somehow value of expression came in to expression');
    }
  }, '');
}

function getExpressionFromPath(path /*:[string, mixed]*/) /*:{expr: string, value: mixed}*/ {
  let _expr = [...path];
  const value /*:mixed*/ = _expr.pop();
  let expr = exprToString(_expr);
  return {expr, value};
}

function getAllExpressionsFromPath(path /*:[string, mixed]*/) /*:string[]*/ {
  let _expr = [...path];
  _expr.pop(); // remove value
  let possibilities = [];
  for (let i = 0; i < _expr.length; i++) {
    possibilities.push(_expr.slice(0, i+1));
  }
  return possibilities.map(e => exprToString(e));
}
