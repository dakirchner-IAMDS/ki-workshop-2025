import { Parser } from "./parser.js";
import { Evaluator, FunctionRegistry } from "./evaluator.js";

/**
 * Main API function to evaluate an expression
 * 
 * @param expression - The expression string to evaluate
 * @param functions - Optional registry of functions that can be called in the expression
 * @returns The evaluated result as a number
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

// Export types and classes
export { Evaluator } from "./evaluator.js";
export type { FunctionRegistry } from "./evaluator.js";
export { Parser } from "./parser.js";
export { Lexer, TokenType } from "./lexer.js";
export type { Token } from "./lexer.js";
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