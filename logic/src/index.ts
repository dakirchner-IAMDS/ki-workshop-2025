import { Parser } from "./parser.js";
import { Evaluator, FunctionRegistry } from "./evaluator.js";

/**
 * Main entry point - evaluate an expression string
 * @param expression The expression to evaluate
 * @param functions Optional function registry for custom functions
 * @returns The result of evaluating the expression
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

// Export all types and classes
export { Parser } from "./parser.js";
export { Lexer, TokenType } from "./lexer.js";
export type { Token } from "./lexer.js";
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