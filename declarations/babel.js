declare module Babel {
  declare type VariableKind = 'var' | 'let' | 'const'

  declare type Declarator = Node;

  declare class Types {
    valueToNode(a :any): Node,
    variableDeclaration(v: VariableKind, d: Declarator[]): Node,
    variableDeclarator(n: Node): Node,
  }

  declare type PluginOptions = {
    types: Types
  }

  declare function PluginFunction(t: PluginOptions): Object

  declare type Plugin = string | Array<any> | PluginFunction

  declare type Preset = {
    plugins: Plugin[]
  }

  declare class Binding {
    scope: Scope,
    path: NodePath,
    deoptValue(): void,
    setValue(v: any): void,
    hasDeoptedValue: bool,
  }

  // This conflicts with the native Node definition
  // and I don't know any other way to override that
  declare class Node {
    body: Object,
    name: string,
  }

  declare class NodePath {
    isIdentifier(): bool,

    isVariableDeclaration(): bool,

    isBlockStatement(): bool,

    isFunctionDeclaration(): bool,
    isFunctionExpression(): bool,
    isClassDeclaration(): bool,
    isClassExpression(): bool,
    scope: Scope,
    node: Node,
    get(s: string): NodePath,
    replaceWith(n: Node): void,
    replaceWithMultiple(n: Node[]): void,
    skip(): void,
    traverse(v: Object): void,
    evaluate(): EvaluateResult,
    getBindingIdentifiers(): Object,

    // others
    forEach(a: any): void,
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
    bindings: Object,
  }

  declare class EvaluateResult {
    confident: bool,
    deopt: NodePath[],
    value: any
  }
}
