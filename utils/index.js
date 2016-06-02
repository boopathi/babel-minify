// utils for tests
export function toComparable(str) {
  return str.replace(/[;\s\f\r\n\t\v]/g, '');
}
export function compare(code1, code2) {
  return toComparable(code1) === toComparable(code2);
}
