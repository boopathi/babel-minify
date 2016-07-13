// @flow
/*::import type {NodePath, Binding, Scope, Node, PluginOptions} from 'Babel';*/
import replaceWith from './replace-with';

export default function Conditionals({types: t} /*:PluginOptions*/) {
  return {
    visitor: {
      Conditional(path /* :NodePath */) {
        const evaluated = path.get('test').evaluate();
        if (!evaluated.confident) {
          return path.skip();
        }
        if (evaluated.value) {
          replaceWith('consequent', path, t);
        } else {
          replaceWith('alternate', path, t);
        }
      }
    }
  };
}
