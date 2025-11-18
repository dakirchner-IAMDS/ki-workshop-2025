import { ASTNode } from './ast.js';

export class Evaluator {
  public evaluate(node: ASTNode): number {
    switch (node.type) {
      case 'Number':
        return node.value;

      case 'UnaryOp':
        return -this.evaluate(node.operand);

      case 'BinaryOp':
        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);

        switch (node.operator) {
          case '+':
            return left + right;
          case '-':
            return left - right;
          case '*':
            return left * right;
          case '/':
            if (right === 0) {
              throw new Error('Division by zero');
            }
            return Math.floor(left / right);
        }
    }
  }
}
