import {
  ASTNode,
  IntegerNode,
  BinaryOpNode,
  UnaryOpNode,
  FunctionCallNode,
} from "./ast.js";

/**
 * Function registry type
 * Maps function names to their implementations
 */
export type FunctionRegistry = {
  [name: string]: (...args: number[]) => number;
};

/**
 * Evaluator class for computing results from an AST
 */
export class Evaluator {
  private functions: FunctionRegistry;

  /**
   * Create a new evaluator with an optional function registry
   */
  constructor(functions: FunctionRegistry = {}) {
    this.functions = functions;
  }

  /**
   * Evaluate an AST node and return the result
   */
  public evaluate(node: ASTNode): number {
    switch (node.type) {
      case "Integer":
        return this.evaluateInteger(node);
      case "BinaryOp":
        return this.evaluateBinaryOp(node);
      case "UnaryOp":
        return this.evaluateUnaryOp(node);
      case "FunctionCall":
        return this.evaluateFunctionCall(node);
      default:
        // TypeScript should ensure this never happens
        throw new Error(`Unknown node type: ${(node as any).type}`);
    }
  }

  /**
   * Evaluate an integer literal node
   */
  private evaluateInteger(node: IntegerNode): number {
    return node.value;
  }

  /**
   * Evaluate a binary operation node
   */
  private evaluateBinaryOp(node: BinaryOpNode): number {
    const left = this.evaluate(node.left);
    const right = this.evaluate(node.right);

    switch (node.operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        if (right === 0) {
          throw new Error("Division by zero");
        }
        return left / right;
      default:
        throw new Error(`Unknown operator: ${node.operator}`);
    }
  }

  /**
   * Evaluate a unary operation node
   */
  private evaluateUnaryOp(node: UnaryOpNode): number {
    const operand = this.evaluate(node.operand);

    switch (node.operator) {
      case "+":
        return operand;
      case "-":
        return -operand;
      default:
        throw new Error(`Unknown operator: ${node.operator}`);
    }
  }

  /**
   * Evaluate a function call node
   */
  private evaluateFunctionCall(node: FunctionCallNode): number {
    // Look up the function
    const func = this.functions[node.name];
    if (!func) {
      throw new Error(`Unknown function: ${node.name}`);
    }

    // Evaluate all arguments
    const evaluatedArgs = node.arguments.map((arg) => this.evaluate(arg));

    // Call the function
    try {
      return func(...evaluatedArgs);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Error calling function ${node.name}: ${errorMessage}`
      );
    }
  }
}
