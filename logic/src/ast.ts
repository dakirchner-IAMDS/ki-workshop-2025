export type ASTNode = NumberNode | BinaryOpNode | UnaryOpNode;

export interface NumberNode {
  type: 'Number';
  value: number;
}

export interface BinaryOpNode {
  type: 'BinaryOp';
  operator: '+' | '-' | '*' | '/';
  left: ASTNode;
  right: ASTNode;
}

export interface UnaryOpNode {
  type: 'UnaryOp';
  operator: '-';
  operand: ASTNode;
}
