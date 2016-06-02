export default function({t: types}) {
  return {
    visitor: {
      Conditional(path) {
        let result = path.get('test').evaluate();
        if (result.confident) {
          if (result.value) {

          } else {

          }
        }
      }
    }
  }
}
