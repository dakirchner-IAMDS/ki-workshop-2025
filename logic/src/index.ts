import { Parser } from "./parser.js";
import { Evaluator, FunctionRegistry } from "./evaluator.js";

/**
 * Evaluate an expression string and return the result
 * 
 * @param expression - The expression string to evaluate
 * @param functions - Optional function registry for custom functions
 * @returns The computed result
 * 
 * @example
 * ```typescript
 * // Basic arithmetic
 * evaluate("2 + 3 * 4"); // → 14
 * 
 * // With custom functions
 * const functions = {
 *   max: (...args: number[]) => Math.max(...args),
 *   abs: (x: number) => Math.abs(x),
 * };
 * evaluate("max(10, 20)", functions); // → 20
 * evaluate("abs(-5) + 3", functions); // → 8
 * ```
 */
export function evaluate(
  expression: string,
  functions?: FunctionRegistry
): number {
  const parser = new Parser(expression);
  const ast = parser.parse();
  const evaluator = new Evaluator(functions);
  return evaluator.evaluate(ast);
}

// Export types and classes for advanced usage
export { Parser } from "./parser.js";
export { Evaluator } from "./evaluator.js";
export type { FunctionRegistry } from "./evaluator.js";
export type {
  ASTNode,
  IntegerNode,
  BinaryOpNode,
  UnaryOpNode,
  FunctionCallNode,
} from "./ast.js";
export {
  createIntegerNode,
  createBinaryOpNode,
  createUnaryOpNode,
  createFunctionCallNode,
} from "./ast.js";
export { Lexer, TokenType } from "./lexer.js";
export type { Token } from "./lexer.js";