import { test, expect, describe } from "vitest";
import { evaluate, Parser, Lexer, TokenType } from "./index.js";

// Test helper functions
const mathFunctions = {
  max: (...args: number[]) => Math.max(...args),
  min: (...args: number[]) => Math.min(...args),
  abs: (x: number) => Math.abs(x),
  add: (a: number, b: number) => a + b,
  pow: (base: number, exp: number) => Math.pow(base, exp),
  random: () => 42, // Deterministic for testing
};

describe("Lexer", () => {
  test("should tokenize identifiers", () => {
    const lexer = new Lexer("max");
    const tokens = lexer.tokenize();
    expect(tokens).toHaveLength(2);
    expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[0].value).toBe("max");
    expect(tokens[1].type).toBe(TokenType.EOF);
  });

  test("should tokenize function call with arguments", () => {
    const lexer = new Lexer("max(1,2)");
    const tokens = lexer.tokenize();
    expect(tokens).toHaveLength(7); // max, (, 1, ,, 2, ), EOF
    expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].type).toBe(TokenType.LPAREN);
    expect(tokens[2].type).toBe(TokenType.INTEGER);
    expect(tokens[3].type).toBe(TokenType.COMMA);
    expect(tokens[4].type).toBe(TokenType.INTEGER);
    expect(tokens[5].type).toBe(TokenType.RPAREN);
  });

  test("should tokenize nested function calls", () => {
    const lexer = new Lexer("max(min(1, 2), 3)");
    const tokens = lexer.tokenize();
    expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[0].value).toBe("max");
    expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[2].value).toBe("min");
  });

  test("should tokenize identifiers with underscores and numbers", () => {
    const lexer = new Lexer("func_name_123");
    const tokens = lexer.tokenize();
    expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[0].value).toBe("func_name_123");
  });
});

describe("Parser", () => {
  test("should parse simple function call", () => {
    const parser = new Parser("max(1, 2)");
    const ast = parser.parse();
    expect(ast.type).toBe("FunctionCall");
    if (ast.type === "FunctionCall") {
      expect(ast.name).toBe("max");
      expect(ast.arguments).toHaveLength(2);
    }
  });

  test("should parse zero arguments function call", () => {
    const parser = new Parser("random()");
    const ast = parser.parse();
    expect(ast.type).toBe("FunctionCall");
    if (ast.type === "FunctionCall") {
      expect(ast.name).toBe("random");
      expect(ast.arguments).toHaveLength(0);
    }
  });

  test("should parse single argument function call", () => {
    const parser = new Parser("abs(-5)");
    const ast = parser.parse();
    expect(ast.type).toBe("FunctionCall");
    if (ast.type === "FunctionCall") {
      expect(ast.name).toBe("abs");
      expect(ast.arguments).toHaveLength(1);
    }
  });

  test("should parse nested function calls", () => {
    const parser = new Parser("max(max(10, 14), 15)");
    const ast = parser.parse();
    expect(ast.type).toBe("FunctionCall");
    if (ast.type === "FunctionCall") {
      expect(ast.name).toBe("max");
      expect(ast.arguments).toHaveLength(2);
      expect(ast.arguments[0].type).toBe("FunctionCall");
    }
  });

  test("should parse mixed expressions with function calls", () => {
    const parser = new Parser("2 + max(3, 4) * 5");
    const ast = parser.parse();
    expect(ast.type).toBe("BinaryOp");
  });

  test("should parse function calls with expression arguments", () => {
    const parser = new Parser("max(1 + 2, 3 * 4)");
    const ast = parser.parse();
    expect(ast.type).toBe("FunctionCall");
    if (ast.type === "FunctionCall") {
      expect(ast.arguments[0].type).toBe("BinaryOp");
      expect(ast.arguments[1].type).toBe("BinaryOp");
    }
  });

  test("should throw error on identifier without parentheses", () => {
    const parser = new Parser("max");
    expect(() => parser.parse()).toThrow("variables are not supported");
  });

  test("should throw error on identifier in middle of expression", () => {
    const parser = new Parser("1 + max");
    expect(() => parser.parse()).toThrow("variables are not supported");
  });
});

describe("Evaluator - Basic Operations", () => {
  test("should evaluate integer literals", () => {
    expect(evaluate("42")).toBe(42);
    expect(evaluate("0")).toBe(0);
  });

  test("should evaluate addition", () => {
    expect(evaluate("1 + 2")).toBe(3);
    expect(evaluate("10 + 20 + 30")).toBe(60);
  });

  test("should evaluate subtraction", () => {
    expect(evaluate("5 - 3")).toBe(2);
    expect(evaluate("100 - 50 - 25")).toBe(25);
  });

  test("should evaluate multiplication", () => {
    expect(evaluate("2 * 3")).toBe(6);
    expect(evaluate("2 * 3 * 4")).toBe(24);
  });

  test("should evaluate division", () => {
    expect(evaluate("10 / 2")).toBe(5);
    expect(evaluate("100 / 10 / 2")).toBe(5);
  });

  test("should respect operator precedence", () => {
    expect(evaluate("2 + 3 * 4")).toBe(14);
    expect(evaluate("10 - 2 * 3")).toBe(4);
  });

  test("should evaluate parenthesized expressions", () => {
    expect(evaluate("(2 + 3) * 4")).toBe(20);
    expect(evaluate("((1 + 2) * (3 + 4))")).toBe(21);
  });

  test("should evaluate unary operations", () => {
    expect(evaluate("+5")).toBe(5);
    expect(evaluate("-5")).toBe(-5);
    expect(evaluate("-(2 + 3)")).toBe(-5);
  });

  test("should throw error on division by zero", () => {
    expect(() => evaluate("1 / 0")).toThrow("Division by zero");
  });
});

describe("Evaluator - Function Calls", () => {
  test("should evaluate simple function call", () => {
    expect(evaluate("max(10, 20)", mathFunctions)).toBe(20);
    expect(evaluate("min(10, 20)", mathFunctions)).toBe(10);
  });

  test("should evaluate function with zero arguments", () => {
    expect(evaluate("random()", mathFunctions)).toBe(42);
  });

  test("should evaluate function with one argument", () => {
    expect(evaluate("abs(-5)", mathFunctions)).toBe(5);
    expect(evaluate("abs(5)", mathFunctions)).toBe(5);
  });

  test("should evaluate function with multiple arguments", () => {
    expect(evaluate("max(1, 2, 3)", mathFunctions)).toBe(3);
    expect(evaluate("min(5, 2, 8, 1)", mathFunctions)).toBe(1);
  });

  test("should evaluate nested function calls", () => {
    expect(evaluate("max(max(10, 14), 15)", mathFunctions)).toBe(15);
    expect(evaluate("min(min(10, 5), 3)", mathFunctions)).toBe(3);
    expect(evaluate("abs(min(-5, -10))", mathFunctions)).toBe(10);
  });

  test("should evaluate function calls mixed with expressions", () => {
    expect(evaluate("abs(-5) + max(1, 2, 3)", mathFunctions)).toBe(8);
    expect(evaluate("2 + max(3, 4) * 5", mathFunctions)).toBe(22);
    expect(evaluate("min(1, 2) * max(3, 4)", mathFunctions)).toBe(4);
  });

  test("should evaluate function calls with expression arguments", () => {
    expect(evaluate("max(1 + 2, 3 * 4)", mathFunctions)).toBe(12);
    expect(evaluate("add(2 * 3, 4 + 5)", mathFunctions)).toBe(15);
  });

  test("should evaluate complex nested expressions", () => {
    expect(evaluate("pow(2, 3) + abs(-5)", mathFunctions)).toBe(13);
    expect(evaluate("max(pow(2, 3), abs(-10))", mathFunctions)).toBe(10);
  });

  test("should handle whitespace in function calls", () => {
    expect(evaluate("max( 1 , 2 )", mathFunctions)).toBe(2);
    expect(evaluate("abs( -5 )", mathFunctions)).toBe(5);
  });

  test("should throw error on unknown function", () => {
    expect(() => evaluate("unknown(1, 2)", mathFunctions)).toThrow(
      "Unknown function: unknown"
    );
  });

  test("should throw error when function throws", () => {
    const funcs = {
      error: () => {
        throw new Error("Function error");
      },
    };
    expect(() => evaluate("error()", funcs)).toThrow(
      "Error calling function error"
    );
  });

  test("should evaluate without functions parameter", () => {
    expect(evaluate("1 + 2")).toBe(3);
    expect(evaluate("(2 + 3) * 4")).toBe(20);
  });
});

describe("Integration Tests", () => {
  test("should handle complex real-world expressions", () => {
    const funcs = {
      max: (...args: number[]) => Math.max(...args),
      min: (...args: number[]) => Math.min(...args),
      abs: (x: number) => Math.abs(x),
      clamp: (val: number, min: number, max: number) =>
        Math.max(min, Math.min(max, val)),
    };

    expect(evaluate("clamp(15, 0, 10)", funcs)).toBe(10);
    expect(evaluate("clamp(5, 0, 10)", funcs)).toBe(5);
    expect(evaluate("clamp(-5, 0, 10)", funcs)).toBe(0);
  });

  test("should evaluate all example expressions from spec", () => {
    expect(evaluate("max(10, 20)", mathFunctions)).toBe(20);
    expect(evaluate("max(max(10, 14), 15)", mathFunctions)).toBe(15);
    expect(evaluate("abs(-5) + max(1, 2, 3)", mathFunctions)).toBe(8);
    expect(evaluate("min(1, 2) * max(3, 4)", mathFunctions)).toBe(4);
    expect(evaluate("2 + add(3, 4)", mathFunctions)).toBe(9);
  });
});