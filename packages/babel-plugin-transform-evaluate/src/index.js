export default function({types: t}) {
  function evaluate(path) {
    const res = path.evaluate();
    if (res.confident) {
      switch (typeof res.value) {
        case 'number':
          path.replaceWith(t.numericLiteral(res.value));
          break;
        case 'boolean':
          path.replaceWith(t.booleanLiteral(res.value));
          break;
        case 'string':
          path.replaceWith(t.stringLiteral(res.value));
          break;
      }
    }
  }

  return {
    visitor: {
      BinaryExpression: { exit: evaluate },
      LogicalExpression: { exit: evaluate },
      CallExpression: { exit: evaluate }
    }
  };
}
