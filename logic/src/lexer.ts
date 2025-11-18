/**
 * Token types for the expression language
 */
export enum TokenType {
  INTEGER = "INTEGER",
  PLUS = "PLUS",
  MINUS = "MINUS",
  MUL = "MUL",
  DIV = "DIV",
  LPAREN = "LPAREN",
  RPAREN = "RPAREN",
  IDENTIFIER = "IDENTIFIER",
  COMMA = "COMMA",
  EOF = "EOF",
}

/**
 * Token structure
 */
export interface Token {
  type: TokenType;
  value: string | number;
  position: number;
}

/**
 * Lexer class - tokenizes input strings
 */
export class Lexer {
  private text: string;
  private position: number;
  private currentChar: string | null;

  constructor(text: string) {
    this.text = text;
    this.position = 0;
    this.currentChar = this.text.length > 0 ? this.text[0] : null;
  }

  /**
   * Advance to the next character
   */
  private advance(): void {
    this.position++;
    this.currentChar =
      this.position < this.text.length ? this.text[this.position] : null;
  }

  /**
   * Skip whitespace characters
   */
  private skipWhitespace(): void {
    while (this.currentChar !== null && /\s/.test(this.currentChar)) {
      this.advance();
    }
  }

  /**
   * Parse an integer from the input
   */
  private parseInteger(): number {
    let numStr = "";
    while (this.currentChar !== null && /\d/.test(this.currentChar)) {
      numStr += this.currentChar;
      this.advance();
    }
    return parseInt(numStr, 10);
  }

  /**
   * Parse an identifier from the input
   * Identifiers start with a letter or underscore and can contain letters, digits, and underscores
   */
  private parseIdentifier(): string {
    let identifier = "";
    while (
      this.currentChar !== null &&
      /[a-zA-Z0-9_]/.test(this.currentChar)
    ) {
      identifier += this.currentChar;
      this.advance();
    }
    return identifier;
  }

  /**
   * Get the next token from the input
   */
  public getNextToken(): Token {
    while (this.currentChar !== null) {
      const pos = this.position;

      // Skip whitespace
      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      // Parse integers
      if (/\d/.test(this.currentChar)) {
        const value = this.parseInteger();
        return { type: TokenType.INTEGER, value, position: pos };
      }

      // Parse identifiers
      if (/[a-zA-Z_]/.test(this.currentChar)) {
        const value = this.parseIdentifier();
        return { type: TokenType.IDENTIFIER, value, position: pos };
      }

      // Parse operators and punctuation
      switch (this.currentChar) {
        case "+":
          this.advance();
          return { type: TokenType.PLUS, value: "+", position: pos };
        case "-":
          this.advance();
          return { type: TokenType.MINUS, value: "-", position: pos };
        case "*":
          this.advance();
          return { type: TokenType.MUL, value: "*", position: pos };
        case "/":
          this.advance();
          return { type: TokenType.DIV, value: "/", position: pos };
        case "(":
          this.advance();
          return { type: TokenType.LPAREN, value: "(", position: pos };
        case ")":
          this.advance();
          return { type: TokenType.RPAREN, value: ")", position: pos };
        case ",":
          this.advance();
          return { type: TokenType.COMMA, value: ",", position: pos };
        default:
          throw new Error(
            `Unexpected character at position ${pos}: ${this.currentChar}`
          );
      }
    }

    // Return EOF token
    return { type: TokenType.EOF, value: "", position: this.position };
  }
}
