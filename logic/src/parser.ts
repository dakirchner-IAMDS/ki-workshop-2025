import { Lexer, Token, TokenType } from "./lexer.js";
import {
  ASTNode,
  createIntegerNode,
  createBinaryOpNode,
  createUnaryOpNode,
  createFunctionCallNode,
} from "./ast.js";

/**
 * Parser class for building an Abstract Syntax Tree from tokens
 */
export class Parser {
  private lexer: Lexer;
  private currentToken: Token;

  constructor(text: string) {
    this.lexer = new Lexer(text);
    this.currentToken = this.lexer.getNextToken();
  }

  /**
   * Consume a token of the expected type
   */
  private eat(tokenType: TokenType): void {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      throw new Error(
        `Unexpected token at position ${this.currentToken.position}: ` +
          `expected ${tokenType}, got ${this.currentToken.type}`
      );
    }
  }

  /**
   * Parse a factor (integer, unary operation, parenthesized expression, or function call)
   * 
   * factor: (PLUS | MINUS) factor
   *       | INTEGER
   *       | LPAREN expr RPAREN
   *       | functionCall
   */
  private factor(): ASTNode {
    const token = this.currentToken;

    // Unary operations: +factor or -factor
    if (token.type === TokenType.PLUS || token.type === TokenType.MINUS) {
      this.eat(token.type);
      const operator = token.value as "+" | "-";
      const operand = this.factor();
      return createUnaryOpNode(operator, operand);
    }

    // Integer literal
    if (token.type === TokenType.INTEGER) {
      this.eat(TokenType.INTEGER);
      return createIntegerNode(token.value as number);
    }

    // Identifier (function call)
    if (token.type === TokenType.IDENTIFIER) {
      const name = token.value as string;
      this.eat(TokenType.IDENTIFIER);

      // Check if it's a function call
      if (this.currentToken.type === TokenType.LPAREN) {
        return this.functionCall(name);
      } else {
        throw new Error(
          `Unexpected identifier at position ${token.position}: ${name}` +
            ` (variables are not supported)`
        );
      }
    }

    // Parenthesized expression
    if (token.type === TokenType.LPAREN) {
      this.eat(TokenType.LPAREN);
      const node = this.expr();
      this.eat(TokenType.RPAREN);
      return node;
    }

    throw new Error(
      `Unexpected token at position ${token.position}: ${token.type}`
    );
  }

  /**
   * Parse a function call
   * 
   * functionCall: IDENTIFIER LPAREN argumentList RPAREN
   */
  private functionCall(name: string): ASTNode {
    this.eat(TokenType.LPAREN);
    const args = this.argumentList();
    this.eat(TokenType.RPAREN);
    return createFunctionCallNode(name, args);
  }

  /**
   * Parse an argument list
   * 
   * argumentList: (expr (COMMA expr)*)?
   */
  private argumentList(): ASTNode[] {
    const args: ASTNode[] = [];

    // Handle empty argument list
    if (this.currentToken.type === TokenType.RPAREN) {
      return args;
    }

    // Parse first argument
    args.push(this.expr());

    // Parse remaining arguments
    while (this.currentToken.type === TokenType.COMMA) {
      this.eat(TokenType.COMMA);
      args.push(this.expr());
    }

    return args;
  }

  /**
   * Parse a term (multiplication and division)
   * 
   * term: factor ((MUL | DIV) factor)*
   */
  private term(): ASTNode {
    let node = this.factor();

    while (
      this.currentToken.type === TokenType.MUL ||
      this.currentToken.type === TokenType.DIV
    ) {
      const token = this.currentToken;
      this.eat(token.type);
      const operator = token.value as "*" | "/";
      const right = this.factor();
      node = createBinaryOpNode(operator, node, right);
    }

    return node;
  }

  /**
   * Parse an expression (addition and subtraction)
   * 
   * expr: term ((PLUS | MINUS) term)*
   */
  private expr(): ASTNode {
    let node = this.term();

    while (
      this.currentToken.type === TokenType.PLUS ||
      this.currentToken.type === TokenType.MINUS
    ) {
      const token = this.currentToken;
      this.eat(token.type);
      const operator = token.value as "+" | "-";
      const right = this.term();
      node = createBinaryOpNode(operator, node, right);
    }

    return node;
  }

  /**
   * Parse the input and return the AST
   */
  public parse(): ASTNode {
    const ast = this.expr();
    if (this.currentToken.type !== TokenType.EOF) {
      throw new Error(
        `Unexpected token at position ${this.currentToken.position}: ` +
          `${this.currentToken.type}`
      );
    }
    return ast;
  }
}
