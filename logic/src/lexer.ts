export enum TokenType {
  NUMBER = 'NUMBER',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  EOF = 'EOF'
}

export interface Token {
  type: TokenType;
  value: string | number;
}

export class Lexer {
  private position: number = 0;
  private currentChar: string | null;

  constructor(private text: string) {
    this.currentChar = this.text.length > 0 ? this.text[0] : null;
  }

  private advance(): void {
    this.position++;
    this.currentChar = this.position < this.text.length ? this.text[this.position] : null;
  }

  private skipWhitespace(): void {
    while (this.currentChar !== null && /\s/.test(this.currentChar)) {
      this.advance();
    }
  }

  private number(): Token {
    let result = '';
    while (this.currentChar !== null && /\d/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    return { type: TokenType.NUMBER, value: parseInt(result, 10) };
  }

  public getNextToken(): Token {
    while (this.currentChar !== null) {
      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      if (/\d/.test(this.currentChar)) {
        return this.number();
      }

      if (this.currentChar === '+') {
        this.advance();
        return { type: TokenType.PLUS, value: '+' };
      }

      if (this.currentChar === '-') {
        this.advance();
        return { type: TokenType.MINUS, value: '-' };
      }

      if (this.currentChar === '*') {
        this.advance();
        return { type: TokenType.MULTIPLY, value: '*' };
      }

      if (this.currentChar === '/') {
        this.advance();
        return { type: TokenType.DIVIDE, value: '/' };
      }

      if (this.currentChar === '(') {
        this.advance();
        return { type: TokenType.LPAREN, value: '(' };
      }

      if (this.currentChar === ')') {
        this.advance();
        return { type: TokenType.RPAREN, value: ')' };
      }

      throw new Error(`Invalid character: ${this.currentChar}`);
    }

    return { type: TokenType.EOF, value: 'EOF' };
  }
}
