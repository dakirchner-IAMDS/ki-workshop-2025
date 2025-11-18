import { test, expect, describe } from "vitest";
import { evaluate, Parser, Lexer, TokenType } from "./index.js";

// ============================================================================
// Lexer Tests
// ============================================================================

describe("Lexer", () => {
  test("should tokenize integers", () => {
    const lexer = new Lexer("123");
    const token = lexer.getNextToken();
    expect(token.type).toBe(TokenType.INTEGER);
    expect(token.value).toBe(123);
  });

  test("should tokenize operators", () => {
    const lexer = new Lexer("+-*/()");
    expect(lexer.getNextToken().type).toBe(TokenType.PLUS);
    expect(lexer.getNextToken().type).toBe(TokenType.MINUS);
    expect(lexer.getNextToken().type).toBe(TokenType.MUL);
    expect(lexer.getNextToken().type).toBe(TokenType.DIV);
    expect(lexer.getNextToken().type).toBe(TokenType.LPAREN);
    expect(lexer.getNextToken().type).toBe(TokenType.RPAREN);
  });

  test("should tokenize identifiers", () => {
    const lexer = new Lexer("max");
    const token = lexer.getNextToken();
    expect(token.type).toBe(TokenType.IDENTIFIER);
    expect(token.value).toBe("max");
  });

  test("should tokenize identifiers with underscores and numbers", () => {
    const lexer = new Lexer("my_func_123");
    const token = lexer.getNextToken();
    expect(token.type).toBe(TokenType.IDENTIFIER);
    expect(token.value).toBe("my_func_123");
  });

  test("should tokenize comma", () => {
    const lexer = new Lexer(",");
    const token = lexer.getNextToken();
    expect(token.type).toBe(TokenType.COMMA);
    expect(token.value).toBe(",");
  });

  test("should tokenize function call", () => {
    const lexer = new Lexer("max(1,2)");
    expect(lexer.getNextToken().type).toBe(TokenType.IDENTIFIER);
    expect(lexer.getNextToken().type).toBe(TokenType.LPAREN);
    expect(lexer.getNextToken().type).toBe(TokenType.INTEGER);
    expect(lexer.getNextToken().type).toBe(TokenType.COMMA);
    expect(lexer.getNextToken().type).toBe(TokenType.INTEGER);
    expect(lexer.getNextToken().type).toBe(TokenType.RPAREN);
  });

  test("should skip whitespace", () => {
    const lexer = new Lexer("  123  +  456  ");
    expect(lexer.getNextToken().value).toBe(123);
    expect(lexer.getNextToken().type).toBe(TokenType.PLUS);
    expect(lexer.getNextToken().value).toBe(456);
  });

  test("should throw error on invalid character", () => {
    const lexer = new Lexer("@");
    expect(() => lexer.getNextToken()).toThrow("Invalid character");
  });
});

// ============================================================================
// Parser Tests
// ============================================================================

describe("Parser", () => {
  test("should parse integer", () => {
    const parser = new Parser("42");
    const ast = parser.parse();
    expect(ast.type).toBe("Integer");
    expect((ast as any).value).toBe(42);
  });

  test("should parse addition", () => {
    const parser = new Parser("1 + 2");
    const ast = parser.parse();
    expect(ast.type).toBe("BinaryOp");
    expect((ast as any).operator).toBe("+");
  });

  test("should parse multiplication with correct precedence", () => {
    const parser = new Parser("2 + 3 * 4");
    const ast = parser.parse();
    expect(ast.type).toBe("BinaryOp");
    expect((ast as any).operator).toBe("+");
    expect((ast as any).right.type).toBe("BinaryOp");
    expect((ast as any).right.operator).toBe("*");
  });

  test("should parse parenthesized expressions", () => {
    const parser = new Parser("(1 + 2) * 3");
    const ast = parser.parse();
    expect(ast.type).toBe("BinaryOp");
    expect((ast as any).operator).toBe("*");
  });

  test("should parse unary operators", () => {
    const parser = new Parser("-5");
    const ast = parser.parse();
    expect(ast.type).toBe("UnaryOp");
    expect((ast as any).operator).toBe("-");
  });

  test("should parse simple function call", () => {
    const parser = new Parser("max(1, 2)");
    const ast = parser.parse();
    expect(ast.type).toBe("FunctionCall");
    expect((ast as any).name).toBe("max");
    expect((ast as any).arguments).toHaveLength(2);
  });

  test("should parse zero argument function call", () => {
    const parser = new Parser("random()");
    const ast = parser.parse();
    expect(ast.type).toBe("FunctionCall");
    expect((ast as any).name).toBe("random");
    expect((ast as any).arguments).toHaveLength(0);
  });

  test("should parse single argument function call", () => {
    const parser = new Parser("abs(-5)");
    const ast = parser.parse();
    expect(ast.type).toBe("FunctionCall");
    expect((ast as any).name).toBe("abs");
    expect((ast as any).arguments).toHaveLength(1);
  });

  test("should parse nested function calls", () => {
    const parser = new Parser("max(max(10, 14), 15)");
    const ast = parser.parse();
    expect(ast.type).toBe("FunctionCall");
    expect((ast as any).name).toBe("max");
    expect((ast as any).arguments[0].type).toBe("FunctionCall");
  });

  test("should parse mixed expressions with functions", () => {
    const parser = new Parser("2 + max(3, 4) * 5");
    const ast = parser.parse();
    expect(ast.type).toBe("BinaryOp");
    expect((ast as any).operator).toBe("+");
  });

  test("should parse function with expression arguments", () => {
    const parser = new Parser("max(1 + 2, 3 * 4)");
    const ast = parser.parse();
    expect(ast.type).toBe("FunctionCall");
    expect((ast as any).arguments[0].type).toBe("BinaryOp");
    expect((ast as any).arguments[1].type).toBe("BinaryOp");
  });

  test("should throw error on identifier without parentheses", () => {
    const parser = new Parser("x");
    expect(() => parser.parse()).toThrow("variables are not supported");
  });

  test("should throw error on unexpected token", () => {
    const parser = new Parser("1 +");
    expect(() => parser.parse()).toThrow();
  });
});

// ============================================================================
// Evaluator Tests
// ============================================================================

describe("Evaluator", () => {
  const functions = {
    max: (...args: number[]) => Math.max(...args),
    min: (...args: number[]) => Math.min(...args),
    abs: (x: number) => Math.abs(x),
    add: (a: number, b: number) => a + b,
    random: () => 42, // Deterministic for testing
  };

  test("should evaluate integer", () => {
    expect(evaluate("42")).toBe(42);
  });

  test("should evaluate addition", () => {
    expect(evaluate("1 + 2")).toBe(3);
  });

  test("should evaluate subtraction", () => {
    expect(evaluate("10 - 3")).toBe(7);
  });

  test("should evaluate multiplication", () => {
    expect(evaluate("4 * 5")).toBe(20);
  });

  test("should evaluate division", () => {
    expect(evaluate("20 / 4")).toBe(5);
  });

  test("should evaluate with correct operator precedence", () => {
    expect(evaluate("2 + 3 * 4")).toBe(14);
  });

  test("should evaluate parenthesized expressions", () => {
    expect(evaluate("(2 + 3) * 4")).toBe(20);
  });

  test("should evaluate unary plus", () => {
    expect(evaluate("+5")).toBe(5);
  });

  test("should evaluate unary minus", () => {
    expect(evaluate("-5")).toBe(-5);
  });

  test("should evaluate complex expression", () => {
    expect(evaluate("(1 + 2) * (3 + 4)")).toBe(21);
  });

  test("should throw error on division by zero", () => {
    expect(() => evaluate("1 / 0")).toThrow("Division by zero");
  });

  test("should evaluate simple function call", () => {
    expect(evaluate("max(10, 20)", functions)).toBe(20);
  });

  test("should evaluate function with multiple arguments", () => {
    expect(evaluate("max(1, 2, 3, 4, 5)", functions)).toBe(5);
  });

  test("should evaluate zero argument function", () => {
    expect(evaluate("random()", functions)).toBe(42);
  });

  test("should evaluate single argument function", () => {
    expect(evaluate("abs(-5)", functions)).toBe(5);
  });

  test("should evaluate nested function calls", () => {
    expect(evaluate("max(max(10, 14), 15)", functions)).toBe(15);
  });

  test("should evaluate functions in expressions", () => {
    expect(evaluate("abs(-5) + max(1, 2, 3)", functions)).toBe(8);
  });

  test("should evaluate mixed arithmetic and functions", () => {
    expect(evaluate("2 + max(3, 4) * 5", functions)).toBe(22);
  });

  test("should evaluate function with expression arguments", () => {
    expect(evaluate("max(1 + 2, 3 * 4)", functions)).toBe(12);
  });

  test("should evaluate multiple nested functions", () => {
    expect(evaluate("min(1, 2) * max(3, 4)", functions)).toBe(4);
  });

  test("should throw error on unknown function", () => {
    expect(() => evaluate("unknown(1, 2)", functions)).toThrow(
      "Unknown function: unknown"
    );
  });

  test("should throw error when function throws", () => {
    const badFunctions = {
      bad: () => {
        throw new Error("Function error");
      },
    };
    expect(() => evaluate("bad()", badFunctions)).toThrow(
      "Error calling function bad"
    );
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe("Integration Tests", () => {
  const mathFunctions = {
    max: (...args: number[]) => Math.max(...args),
    min: (...args: number[]) => Math.min(...args),
    abs: (x: number) => Math.abs(x),
    pow: (base: number, exp: number) => Math.pow(base, exp),
    clamp: (val: number, min: number, max: number) =>
      Math.max(min, Math.min(max, val)),
  };

  test("should evaluate max(10, 20)", () => {
    expect(evaluate("max(10, 20)", mathFunctions)).toBe(20);
  });

  test("should evaluate max(max(10, 14), 15)", () => {
    expect(evaluate("max(max(10, 14), 15)", mathFunctions)).toBe(15);
  });

  test("should evaluate abs(-5) + max(1, 2, 3)", () => {
    expect(evaluate("abs(-5) + max(1, 2, 3)", mathFunctions)).toBe(8);
  });

  test("should evaluate min(1, 2) * max(3, 4)", () => {
    expect(evaluate("min(1, 2) * max(3, 4)", mathFunctions)).toBe(4);
  });

  test("should evaluate pow(2, 3) + abs(-5)", () => {
    expect(evaluate("pow(2, 3) + abs(-5)", mathFunctions)).toBe(13);
  });

  test("should evaluate clamp(15, 0, 10)", () => {
    expect(evaluate("clamp(15, 0, 10)", mathFunctions)).toBe(10);
  });

  test("should handle whitespace in function calls", () => {
    expect(evaluate("max( 1 , 2 )", mathFunctions)).toBe(2);
  });

  test("should evaluate complex nested expression", () => {
    expect(
      evaluate("max(abs(-10), pow(2, 3)) + min(5, 3)", mathFunctions)
    ).toBe(13);
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe("Edge Cases", () => {
  const functions = {
    identity: (x: number) => x,
    sum: (...args: number[]) => args.reduce((a, b) => a + b, 0),
  };

  test("should handle empty expression fails", () => {
    expect(() => evaluate("")).toThrow();
  });

  test("should handle multiple spaces", () => {
    expect(evaluate("  1   +   2  ")).toBe(3);
  });

  test("should handle deeply nested parentheses", () => {
    expect(evaluate("((((1 + 2))))")).toBe(3);
  });

  test("should handle function with many arguments", () => {
    expect(evaluate("sum(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)", functions)).toBe(55);
  });

  test("should handle negative numbers in function arguments", () => {
    expect(evaluate("identity(-42)", functions)).toBe(-42);
  });
});