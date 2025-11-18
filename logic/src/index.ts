export function hello(name: string) {
  return `Hello, ${name}!!`;
}

export { Lexer, TokenType } from './lexer.js';
export type { Token } from './lexer.js';
export { Parser } from './parser.js';
export type { ASTNode, NumberNode, BinaryOpNode, UnaryOpNode } from './ast.js';
export { Evaluator } from './evaluator.js';
export { evaluateExpression } from './expression.js';