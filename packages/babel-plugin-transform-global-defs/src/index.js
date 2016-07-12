// @flow
/*::import type {NodePath, Binding, Scope, Node, PluginOptions} from 'Babel';*/

import isPlainObject from 'lodash.isplainobject';
import isObjectLike from 'lodash.isobjectlike';

/*::type RawDefinition = [string, mixed]*/

/*::type Definition = {
  expr: string,
  value: mixed,
  allExpr: string[],
  root: string,
}*/

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
  let deopts = new Set();

  /**
   * A defintion is a modified form of globalDefs giving access
   * to all the paths of the object
   *
   * For example,
   *
   * global_defs = { a: { b: true, c: 50 } }
   *
   * definitions =
   * [
   *   {
   *     root: "a",
   *     expr: "a.b",
   *     value: true,
   *     allExpr: [ "a", "a.b" ]
   *   },
   *   {
   *     root: "a",
   *     expr: "a.c",
   *     value: 50,
   *     allExpr: [ "a", "a.c" ]
   *   }
   * ]
   */
  let definitions /*:Definition[]*/= [];

  /**
   * deopts the expression,
   * just adds it to the plugin wide reference to deopts
   */
  function deopt(expr /*:string*/) {
    // debug
    // console.log('deopting', expr);
    deopts.add(expr);
  }

  /**
   * Find if an expression is deopted.
   *
   * An expression is deopted IF any of its parent paths is deopted
   *
   * eg:
   * deopts = ["a.b"];
   * isDeopt("a.b.c") //=> true
   */
  function isDeopt(_expr /*:string|[string]*/) /*:bool*/{
    let expr = Array.isArray(_expr) ? _expr : [_expr];
    for (let subexpr of expr) {
      if (deopts.has(subexpr)) {
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
        if (!isPlainObject(global_defs)) {
          throw new Error('global_defs must be a Plain Object');
        }

        /**
         * Assign to globalDefs to be accessed by other hooks
         */
        globalDefs = global_defs;

        // !important
        // flush the deopts, otherwise it is preserved in memory
        deopts = new Set();

        definitions = objectToPaths(globalDefs).map(p => pathToDefn(p));
      },

      // TODO
      // UpdateExpression x++ things

      AssignmentExpression(path /*:NodePath*/) {
        const left = path.get('left');

        /**
         * Traverse through every possibility of every path
         * obtained from the global_defs and match it with the
         * left side of the assignment, check that it's actually
         * modifying the global scoped var and not some other local
         * or outer scoped var, and deopt that expression.
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
           * Only these paths can be the possible parents (of an Identifier),
           * for which a global definition can be safely replaced.
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
           * we traverse through all the roots of the definition,
           * determine if we can replace, and replace it
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
           * 2. not locals or vars in outer scopes
           */
          definitions.filter(({root, expr}) => root !== expr)
            .forEach(({root, expr, value, allExpr}) => {
              if (path.matchesPattern(expr)
                && !path.scope.hasBinding(root)
                && path.scope.hasGlobal(root)
                && !isDeopt(allExpr)
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
 * Converts an expression in the form of array to dot notation and a value
 *
 * in  => ['a', 'b', true]
 * out => {
 *   expr: 'a.b',
 *   value: true,
 *   allExpr: ['a', 'a.b'],
 *   root: 'a'
 * }
 */
function pathToDefn(path /*:RawDefinition*/) /*:Definition*/ {
  let _expr = [...path], possibilities = [];
  const value /*:mixed*/ = _expr.pop();

  for (let i = 0; i < _expr.length; i++) {
    possibilities.push(_expr.slice(0, i+1));
  }

  return {
    expr: exprToString(_expr),
    allExpr: possibilities.map(e => exprToString(e)),
    root: path[0],
    value
  };
}

/**
 * Converts an expression represented in the form of array to dot notation
 *
 * in  => ['a', 'b', 'c', 0, 'd']
 * out => 'a.b.c[0].d'
 */
function exprToString(expr /*:RawDefinition*/) /*:string*/ {
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
function objectToPaths(obj /*:Object*/) /*:RawDefinition[] */ {
  // To detect circular references
  let visited = new Set();

  let paths /*RawDefinition[]*/ = [];

  function walk(o, state /*:[number|string]*/= []) {
    // detect cyclic references
    if (isObjectLike(o)) {
      if (visited.has(o)) {
        throw new Error('Circular reference in global_defs not supported');
      }
      visited.add(o);
    }

    // traverse
    if (Array.isArray(o)) {
      for (let i = 0; i < o.length; i++) {
        walk(o[i], [...state, i]);
      }
    } else if (isPlainObject(o)) {
      const keys = Object.keys(o);
      for (let key of keys) {
        walk(o[key], [...state, key]);
      }
    } else if (isObjectLike(o)) {
      throw new TypeError('No support for Object like things' + o.toString());
    } else {
      paths.push([...state, o]);
    }
  }

  walk(obj);
  return paths;
}
