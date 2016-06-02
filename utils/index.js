// utils for tests
export function trim(str) {
  return str.replace(/[;\s\f\r\n\t\v]/g, '');
}
export function compare(code1, code2) {
  return trim(code1) === trim(code2);
}
