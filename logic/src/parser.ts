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
 * 
 * Grammar:
 * expr:       term ((PLUS | MINUS) term)*
 * term:       factor ((MUL | DIV) factor)*
 * factor:     (PLUS | MINUS) factor 
 *           | INTEGER 
 *           | LPAREN expr RPAREN
 *           | functionCall
 * 
 * functionCall: IDENTIFIER LPAREN argumentList RPAREN
 * argumentList: (expr (COMMA expr)*)?
 */
export class Parser {
  private lexer: Lexer;
  private currentToken: Token;

  constructor(input: string) {
    this.lexer = new Lexer(input);
    this.currentToken = this.lexer.getNextToken();
  }

  /**
   * Consume the current token if it matches the expected type
   * @throws Error if the token type doesn't match
   */
  private eat(tokenType: TokenType): void {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      throw new Error(
        `Expected token ${tokenType} but got ${this.currentToken.type} ` +
        `at position ${this.currentToken.position}`
      );
    }
  }

  /**
   * Parse a factor (highest precedence)
   * factor: (PLUS | MINUS) factor | INTEGER | LPAREN expr RPAREN | functionCall
   */
  private factor(): ASTNode {
    const token = this.currentToken;

    // Unary plus or minus
    if (token.type === TokenType.PLUS) {
      this.eat(TokenType.PLUS);
      return createUnaryOpNode("+", this.factor());
    } else if (token.type === TokenType.MINUS) {
      this.eat(TokenType.MINUS);
      return createUnaryOpNode("-", this.factor());
    }
    // Integer literal
    else if (token.type === TokenType.INTEGER) {
      this.eat(TokenType.INTEGER);
      return createIntegerNode(token.value as number);
    }
    // Identifier (function call)
    else if (token.type === TokenType.IDENTIFIER) {
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
    else if (token.type === TokenType.LPAREN) {
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
   * functionCall: LPAREN argumentList RPAREN
   * 
   * Note: The function name has already been consumed by factor()
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
      if (token.type === TokenType.MUL) {
        this.eat(TokenType.MUL);
        node = createBinaryOpNode("*", node, this.factor());
      } else if (token.type === TokenType.DIV) {
        this.eat(TokenType.DIV);
        node = createBinaryOpNode("/", node, this.factor());
      }
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
      if (token.type === TokenType.PLUS) {
        this.eat(TokenType.PLUS);
        node = createBinaryOpNode("+", node, this.term());
      } else if (token.type === TokenType.MINUS) {
        this.eat(TokenType.MINUS);
        node = createBinaryOpNode("-", node, this.term());
      }
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
