declare class Binding {
  scope: Scope,
  path: NodePath,
}

declare class NodePath {
  isIdentifier(): bool,

  isVariableDeclaration(): bool,

  isFunctionDeclaration(): bool,
  isFunctionExpression(): bool,
  isClassDeclaration(): bool,
  isClassExpression(): bool,
  scope: Scope,
}

declare class Scope {
  getFunctionParent(): Scope,
  getProgramParent(): Scope,
  getBinding(b: string): Binding,
  rename(a: string, b: string): void,
  hasOwnBinding(a: string): bool,
  getAllBindings(): Object,
  hasReference(a: string): bool,
  hasGlobal(a: string): bool,
  hasBinding(a: string): bool,
}
