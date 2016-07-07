// @flow
/*::import type {NodePath, Binding, Scope, Node, PluginOptions} from 'Babel';*/
export default function ({types: t} /*:PluginOptions*/) {
  /**
   * A plugin wide reference to the globalDefs passed from the user
   * with validations applied
   */
  let globalDefs /*:Object*/ = {};

  /**
   * A plugin wide reference for the deopts applied.
   *
   * A deopt is simply a dot notation of an object path
   * eg: a.b.c.d (or) a.b
   * which means all sub-paths of this path are deopted
   */
  let deopts /*:string[]*/ = [];

  /**
   * A store of definitions of all paths of the globalDefs
   * eg: for an object that is
   * globalDefs = {
   *   process: { env: { DEBUG: true, TEST: false } }
   * }
   * =>
   * [
   *   ["process", "env", "DEBUG", true],
   *   ["process", "env", "DEBUG", false]
   * ]
   */
  let _definitions /*:[[string, mixed]]*/ = [];

  /**
   * A useful conversion of the above definitions into some
   * Object form
   *
   * For the same example as mentioned above,
   * [
   *   {
   *     root: "process",
   *     expr: "process.env.DEBUG",
   *     value: true,
   *     allExpr: [
   *       "process",
   *       "process.env",
   *       "process.env.DEBUG"
   *     ]
   *   },
   *   {
   *     root: "process",
   *     expr: "process.env.TEST",
   *     value: true,
   *     allExpr: [
   *       "process",
   *       "process.env",
   *       "process.env.TEST"
   *     ]
   *   }
   * ]
   */
  let definitions /*:[{
    root:string,
    expr: string,
    value: mixed,
    allExpr: [string]
  }]*/= [];

  /**
   * deopts the expression,
   * just adds it to the plugin wide reference to deopts
   */
  function deopt(expr /*:string*/) {
    // debug
    // console.log('deopting', expr);
    deopts.push(expr);
  }

  /**
   * Find if an expression is deopted.
   *
   * An expression is deopted IF any of its sub expressions -
   * i.e. any of the parent paths from this this expression could
   * be reached is deopted
   *
   * eg:
   * deopts = ["a.b"];
   * isDeopt("a.b.c") //=> true
   */
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
        /**
         * validate it's a plain object
         */
        if (!global_defs || typeof global_defs !== 'object' || Array.isArray(global_defs)) {
          throw new Error('global_defs must be a Plain Object');
        }

        /**
         * validate that there are no circular references
         */
        if (hasCircularReference(global_defs)) {
          throw new Error('global_defs has a circular referece');
        }

        /**
         * Assign to this to be accessed by other hooks
         */
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

        /**
         * we traverse through every possibility of every path
         * obtained from the global_defs and match it with the
         * left side of the assignment, check that it's actually
         * modifying the global scoped var and not some other local
         * or outer scoped var, and then deopt that expression.
         */
        definitions.forEach(({root, allExpr}) => {
          allExpr.forEach(expr => {
            let match = false;

            if (left.isIdentifier()) {
              /**
               * process = "blah";
               */
              if (left.node.name === expr) {
                match = true;
              }
            } else if (left.isMemberExpression()) {
              /**
               * process.env.NODE_ENV = "development";
               */
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
          /**
           * Only these paths can be the possible parents,
           * for which a global definition can be safely
           * replaced.
           */
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

          /**
           * Since it's just an Identifier, it's enough that
           * we traverse through all the roots of the definition
           * determine if we can replace, and replace it in place.
           *
           * So, we simply filter out other expressions from global definitions
           */
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
          /**
           * Replace all member expressions that are
           * 1. not deopted
           * 2. not locals or vars in other scopes
           */
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

/**
 * Determine if an object has a circular reference.
 * Since we calculate all possible paths that can be taken
 * in the object, we need this property in global_defs
 */
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

/**
 * returns the list of paths that can be taken to reach a leaf
 * given an object
 *
 * eg:
 * obj = { a: 1, b: { a: 2, b: 3 }}
 * out =>
 * [
 *   ['a', 1],
 *   ['b', 'a', 2],
 *   ['b', 'b', 3]
 * ]
 */
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

/**
 * Converts an expression represented in the form of array to dot notation
 *
 * in  => ['a', 'b', 'c', 0, 'd']
 * out => 'a.b.c[0].d'
 */
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

/**
 * Converts an expression in the form of array to dot notation and a value
 *
 * in  => ['a', 'b', true]
 * out => { expr: 'a.b', value: true }
 */
function getExpressionFromPath(path /*:[string, mixed]*/) /*:{expr: string, value: mixed}*/ {
  let _expr = [...path];
  const value /*:mixed*/ = _expr.pop();
  let expr = exprToString(_expr);
  return {expr, value};
}

/**
 * Finds all possible parent paths for a particular expression.
 * Leaves out the value part
 *
 * in  => ['a', 'b', 'c', true]
 * out => [
 *   'a',
 *   'a.b',
 *   'a.b.c'
 * ]
 */
function getAllExpressionsFromPath(path /*:[string, mixed]*/) /*:string[]*/ {
  let _expr = [...path];
  _expr.pop(); // remove value
  let possibilities = [];
  for (let i = 0; i < _expr.length; i++) {
    possibilities.push(_expr.slice(0, i+1));
  }
  return possibilities.map(e => exprToString(e));
}
