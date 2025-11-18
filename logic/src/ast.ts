/**
 * Base interface for all AST nodes
 */
export interface BaseNode {
  type: string;
}

/**
 * Integer literal node
 */
export interface IntegerNode extends BaseNode {
  type: "Integer";
  value: number;
}

/**
 * Binary operation node (+, -, *, /)
 */
export interface BinaryOpNode extends BaseNode {
  type: "BinaryOp";
  operator: "+" | "-" | "*" | "/";
  left: ASTNode;
  right: ASTNode;
}

/**
 * Unary operation node (+, -)
 */
export interface UnaryOpNode extends BaseNode {
  type: "UnaryOp";
  operator: "+" | "-";
  operand: ASTNode;
}

/**
 * Function call node
 */
export interface FunctionCallNode extends BaseNode {
  type: "FunctionCall";
  name: string;
  arguments: ASTNode[];
}

/**
 * Union type of all AST nodes
 */
export type ASTNode =
  | IntegerNode
  | BinaryOpNode
  | UnaryOpNode
  | FunctionCallNode;

/**
 * Factory function to create an integer node
 */
export function createIntegerNode(value: number): IntegerNode {
  return { type: "Integer", value };
}

/**
 * Factory function to create a binary operation node
 */
export function createBinaryOpNode(
  operator: "+" | "-" | "*" | "/",
  left: ASTNode,
  right: ASTNode
): BinaryOpNode {
  return { type: "BinaryOp", operator, left, right };
}

/**
 * Factory function to create a unary operation node
 */
export function createUnaryOpNode(
  operator: "+" | "-",
  operand: ASTNode
): UnaryOpNode {
  return { type: "UnaryOp", operator, operand };
}

/**
 * Factory function to create a function call node
 */
export function createFunctionCallNode(
  name: string,
  args: ASTNode[]
): FunctionCallNode {
  return { type: "FunctionCall", name, arguments: args };
}
