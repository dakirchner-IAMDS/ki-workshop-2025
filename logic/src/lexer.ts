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
 * Token structure with type, value, and position
 */
export interface Token {
  type: TokenType;
  value: string | number;
  position: number;
}

/**
 * Lexer class for tokenizing expression strings
 */
export class Lexer {
  private text: string;
  private pos: number;
  private currentChar: string | null;

  constructor(text: string) {
    this.text = text;
    this.pos = 0;
    this.currentChar = this.text.length > 0 ? this.text[0] : null;
  }

  /**
   * Advance the position pointer and update currentChar
   */
  private advance(): void {
    this.pos++;
    if (this.pos >= this.text.length) {
      this.currentChar = null;
    } else {
      this.currentChar = this.text[this.pos];
    }
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
   * Parse an integer from the current position
   */
  private parseInteger(): number {
    let numStr = "";
    while (this.currentChar !== null && /[0-9]/.test(this.currentChar)) {
      numStr += this.currentChar;
      this.advance();
    }
    return parseInt(numStr, 10);
  }

  /**
   * Parse an identifier from the current position
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
      const pos = this.pos;

      // Skip whitespace
      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      // Parse integers
      if (/[0-9]/.test(this.currentChar)) {
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
            `Invalid character at position ${pos}: '${this.currentChar}'`
          );
      }
    }

    return { type: TokenType.EOF, value: "", position: this.pos };
  }

  /**
   * Get all tokens from the input
   */
  public tokenize(): Token[] {
    const tokens: Token[] = [];
    let token = this.getNextToken();
    while (token.type !== TokenType.EOF) {
      tokens.push(token);
      token = this.getNextToken();
    }
    tokens.push(token); // Add EOF token
    return tokens;
  }
}
