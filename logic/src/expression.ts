import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Evaluator } from './evaluator.js';

export function evaluateExpression(expression: string): number {
  const lexer = new Lexer(expression);
  const parser = new Parser(lexer);
  const ast = parser.parse();
  const evaluator = new Evaluator();
  return evaluator.evaluate(ast);
}
