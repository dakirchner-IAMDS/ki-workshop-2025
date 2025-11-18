import { Lexer, Token, TokenType } from "./lexer.js";
import {
  ASTNode,
  createIntegerNode,
  createBinaryOpNode,
  createUnaryOpNode,
  createFunctionCallNode,
} from "./ast.js";

/**
 * Parser class - builds an Abstract Syntax Tree (AST) from tokens
 * 
 * Grammar:
 * expr:       term ((PLUS | MINUS) term)*
 * term:       factor ((MUL | DIV) factor)*
 * factor:     (PLUS | MINUS) factor 
 *           | INTEGER 
 *           | LPAREN expr RPAREN
 *           | functionCall
 * functionCall: IDENTIFIER LPAREN argumentList RPAREN
 * argumentList: (expr (COMMA expr)*)?
 */
export class Parser {
  private lexer: Lexer;
  private currentToken: Token;

  constructor(text: string) {
    this.lexer = new Lexer(text);
    this.currentToken = this.lexer.getNextToken();
  }

  /**
   * Consume the current token if it matches the expected type
   * @throws Error if token type doesn't match
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
   * Parse a factor (highest precedence)
   * factor: (PLUS | MINUS) factor | INTEGER | LPAREN expr RPAREN | functionCall
   */
  private factor(): ASTNode {
    const token = this.currentToken;

    // Unary operators
    if (token.type === TokenType.PLUS || token.type === TokenType.MINUS) {
      const operator = token.type === TokenType.PLUS ? "+" : "-";
      this.eat(token.type);
      return createUnaryOpNode(operator, this.factor());
    }

    // Integer literals
    if (token.type === TokenType.INTEGER) {
      this.eat(TokenType.INTEGER);
      return createIntegerNode(token.value as number);
    }

    // Identifiers (function calls)
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

    // Parenthesized expressions
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
   * term: factor ((MUL | DIV) factor)*
   */
  private term(): ASTNode {
    let node = this.factor();

    while (
      this.currentToken.type === TokenType.MUL ||
      this.currentToken.type === TokenType.DIV
    ) {
      const token = this.currentToken;
      const operator = token.type === TokenType.MUL ? "*" : "/";
      this.eat(token.type);
      node = createBinaryOpNode(operator, node, this.factor());
    }

    return node;
  }

  /**
   * Parse an expression (addition and subtraction)
   * expr: term ((PLUS | MINUS) term)*
   */
  private expr(): ASTNode {
    let node = this.term();

    while (
      this.currentToken.type === TokenType.PLUS ||
      this.currentToken.type === TokenType.MINUS
    ) {
      const token = this.currentToken;
      const operator = token.type === TokenType.PLUS ? "+" : "-";
      this.eat(token.type);
      node = createBinaryOpNode(operator, node, this.term());
    }

    return node;
  }

  /**
   * Parse the input and return the AST
   */
  public parse(): ASTNode {
    const node = this.expr();
    if (this.currentToken.type !== TokenType.EOF) {
      throw new Error(
        `Unexpected token at position ${this.currentToken.position}: ` +
          `${this.currentToken.type}`
      );
    }
    return node;
  }
}
