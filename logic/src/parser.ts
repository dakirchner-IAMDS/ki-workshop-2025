import { Lexer, Token, TokenType } from './lexer.js';
import { ASTNode, NumberNode, BinaryOpNode, UnaryOpNode } from './ast.js';

export class Parser {
  private currentToken: Token;

  constructor(private lexer: Lexer) {
    this.currentToken = this.lexer.getNextToken();
  }

  private eat(tokenType: TokenType): void {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      throw new Error(`Expected token ${tokenType}, got ${this.currentToken.type}`);
    }
  }

  // factor : (PLUS | MINUS) factor | NUMBER | LPAREN expr RPAREN
  private factor(): ASTNode {
    const token = this.currentToken;

    if (token.type === TokenType.PLUS) {
      this.eat(TokenType.PLUS);
      return this.factor();
    }

    if (token.type === TokenType.MINUS) {
      this.eat(TokenType.MINUS);
      const node: UnaryOpNode = {
        type: 'UnaryOp',
        operator: '-',
        operand: this.factor()
      };
      return node;
    }

    if (token.type === TokenType.NUMBER) {
      this.eat(TokenType.NUMBER);
      const node: NumberNode = {
        type: 'Number',
        value: token.value as number
      };
      return node;
    }

    if (token.type === TokenType.LPAREN) {
      this.eat(TokenType.LPAREN);
      const node = this.expr();
      this.eat(TokenType.RPAREN);
      return node;
    }

    throw new Error(`Unexpected token: ${token.type}`);
  }

  // term : factor ((MULTIPLY | DIVIDE) factor)*
  private term(): ASTNode {
    let node = this.factor();

    while (this.currentToken.type === TokenType.MULTIPLY || this.currentToken.type === TokenType.DIVIDE) {
      const token = this.currentToken;
      if (token.type === TokenType.MULTIPLY) {
        this.eat(TokenType.MULTIPLY);
      } else if (token.type === TokenType.DIVIDE) {
        this.eat(TokenType.DIVIDE);
      }

      const binaryNode: BinaryOpNode = {
        type: 'BinaryOp',
        operator: token.value as '+' | '-' | '*' | '/',
        left: node,
        right: this.factor()
      };
      node = binaryNode;
    }

    return node;
  }

  // expr : term ((PLUS | MINUS) term)*
  private expr(): ASTNode {
    let node = this.term();

    while (this.currentToken.type === TokenType.PLUS || this.currentToken.type === TokenType.MINUS) {
      const token = this.currentToken;
      if (token.type === TokenType.PLUS) {
        this.eat(TokenType.PLUS);
      } else if (token.type === TokenType.MINUS) {
        this.eat(TokenType.MINUS);
      }

      const binaryNode: BinaryOpNode = {
        type: 'BinaryOp',
        operator: token.value as '+' | '-' | '*' | '/',
        left: node,
        right: this.term()
      };
      node = binaryNode;
    }

    return node;
  }

  public parse(): ASTNode {
    const node = this.expr();
    if (this.currentToken.type !== TokenType.EOF) {
      throw new Error('Expected end of expression');
    }
    return node;
  }
}
