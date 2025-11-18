import { test, expect, describe } from "vitest";
import { evaluate, Lexer, Parser, TokenType } from "./index.js";

// Test functions for use in integration tests
const testFunctions = {
  max: (...args: number[]) => Math.max(...args),
  min: (...args: number[]) => Math.min(...args),
  abs: (x: number) => Math.abs(x),
  add: (a: number, b: number) => a + b,
  random: () => 42, // Fixed value for testing
  pow: (base: number, exp: number) => Math.pow(base, exp),
};

describe("Lexer", () => {
  test("tokenize integers", () => {
    const lexer = new Lexer("123");
    const token1 = lexer.getNextToken();
    expect(token1.type).toBe(TokenType.INTEGER);
    expect(token1.value).toBe(123);
    
    const token2 = lexer.getNextToken();
    expect(token2.type).toBe(TokenType.EOF);
  });

  test("tokenize identifiers", () => {
    const lexer = new Lexer("max");
    const token1 = lexer.getNextToken();
    expect(token1.type).toBe(TokenType.IDENTIFIER);
    expect(token1.value).toBe("max");
    
    const token2 = lexer.getNextToken();
    expect(token2.type).toBe(TokenType.EOF);
  });

  test("tokenize function call", () => {
    const lexer = new Lexer("max(1,2)");
    expect(lexer.getNextToken().type).toBe(TokenType.IDENTIFIER);
    expect(lexer.getNextToken().type).toBe(TokenType.LPAREN);
    expect(lexer.getNextToken().type).toBe(TokenType.INTEGER);
    expect(lexer.getNextToken().type).toBe(TokenType.COMMA);
    expect(lexer.getNextToken().type).toBe(TokenType.INTEGER);
    expect(lexer.getNextToken().type).toBe(TokenType.RPAREN);
    expect(lexer.getNextToken().type).toBe(TokenType.EOF);
  });

  test("tokenize operators", () => {
    const lexer = new Lexer("+ - * / ( )");
    expect(lexer.getNextToken().type).toBe(TokenType.PLUS);
    expect(lexer.getNextToken().type).toBe(TokenType.MINUS);
    expect(lexer.getNextToken().type).toBe(TokenType.MUL);
    expect(lexer.getNextToken().type).toBe(TokenType.DIV);
    expect(lexer.getNextToken().type).toBe(TokenType.LPAREN);
    expect(lexer.getNextToken().type).toBe(TokenType.RPAREN);
    expect(lexer.getNextToken().type).toBe(TokenType.EOF);
  });

  test("handle whitespace", () => {
    const lexer = new Lexer("  1  +  2  ");
    expect(lexer.getNextToken().type).toBe(TokenType.INTEGER);
    expect(lexer.getNextToken().type).toBe(TokenType.PLUS);
    expect(lexer.getNextToken().type).toBe(TokenType.INTEGER);
    expect(lexer.getNextToken().type).toBe(TokenType.EOF);
  });
});

describe("Parser", () => {
  test("parse simple integer", () => {
    const parser = new Parser("42");
    const ast = parser.parse();
    expect(ast.type).toBe("Integer");
    expect((ast as any).value).toBe(42);
  });

  test("parse addition", () => {
    const parser = new Parser("1 + 2");
    const ast = parser.parse();
    expect(ast.type).toBe("BinaryOp");
    expect((ast as any).operator).toBe("+");
  });

  test("parse simple function call", () => {
    const parser = new Parser("max(1, 2)");
    const ast = parser.parse();
    expect(ast.type).toBe("FunctionCall");
    expect((ast as any).name).toBe("max");
    expect((ast as any).arguments.length).toBe(2);
  });

  test("parse zero arguments function", () => {
    const parser = new Parser("random()");
    const ast = parser.parse();
    expect(ast.type).toBe("FunctionCall");
    expect((ast as any).name).toBe("random");
    expect((ast as any).arguments.length).toBe(0);
  });

  test("parse single argument function", () => {
    const parser = new Parser("abs(-5)");
    const ast = parser.parse();
    expect(ast.type).toBe("FunctionCall");
    expect((ast as any).name).toBe("abs");
    expect((ast as any).arguments.length).toBe(1);
  });

  test("parse nested function calls", () => {
    const parser = new Parser("max(max(10, 14), 15)");
    const ast = parser.parse();
    expect(ast.type).toBe("FunctionCall");
    expect((ast as any).name).toBe("max");
    expect((ast as any).arguments.length).toBe(2);
    expect((ast as any).arguments[0].type).toBe("FunctionCall");
  });

  test("parse mixed expressions", () => {
    const parser = new Parser("2 + max(3, 4) * 5");
    const ast = parser.parse();
    expect(ast.type).toBe("BinaryOp");
    expect((ast as any).operator).toBe("+");
  });

  test("error on identifier without parentheses", () => {
    const parser = new Parser("max");
    expect(() => parser.parse()).toThrow("variables are not supported");
  });

  test("parse parenthesized expression", () => {
    const parser = new Parser("(1 + 2) * 3");
    const ast = parser.parse();
    expect(ast.type).toBe("BinaryOp");
    expect((ast as any).operator).toBe("*");
  });
});

describe("Basic arithmetic evaluation", () => {
  test("evaluate integer", () => {
    expect(evaluate("42")).toBe(42);
  });

  test("evaluate addition", () => {
    expect(evaluate("1 + 2")).toBe(3);
  });

  test("evaluate subtraction", () => {
    expect(evaluate("5 - 3")).toBe(2);
  });

  test("evaluate multiplication", () => {
    expect(evaluate("3 * 4")).toBe(12);
  });

  test("evaluate division", () => {
    expect(evaluate("10 / 2")).toBe(5);
  });

  test("evaluate unary plus", () => {
    expect(evaluate("+5")).toBe(5);
  });

  test("evaluate unary minus", () => {
    expect(evaluate("-5")).toBe(-5);
  });

  test("evaluate parentheses", () => {
    expect(evaluate("(1 + 2) * 3")).toBe(9);
  });

  test("evaluate operator precedence", () => {
    expect(evaluate("2 + 3 * 4")).toBe(14);
  });

  test("error on division by zero", () => {
    expect(() => evaluate("1 / 0")).toThrow("Division by zero");
  });
});

describe("Function call evaluation", () => {
  test("evaluate simple function call", () => {
    const result = evaluate("max(10, 20)", testFunctions);
    expect(result).toBe(20);
  });

  test("evaluate zero arguments function", () => {
    const result = evaluate("random()", testFunctions);
    expect(result).toBe(42);
  });

  test("evaluate single argument function", () => {
    const result = evaluate("abs(-5)", testFunctions);
    expect(result).toBe(5);
  });

  test("evaluate multiple arguments function", () => {
    const result = evaluate("max(1, 2, 3)", testFunctions);
    expect(result).toBe(3);
  });

  test("evaluate nested function calls", () => {
    const result = evaluate("max(max(10, 14), 15)", testFunctions);
    expect(result).toBe(15);
  });

  test("evaluate function in expression", () => {
    const result = evaluate("abs(-5) + max(1, 2, 3)", testFunctions);
    expect(result).toBe(8);
  });

  test("evaluate multiple functions in expression", () => {
    const result = evaluate("min(1, 2) * max(3, 4)", testFunctions);
    expect(result).toBe(4);
  });

  test("evaluate function with expression arguments", () => {
    const result = evaluate("max(1 + 2, 3 * 4)", testFunctions);
    expect(result).toBe(12);
  });

  test("evaluate complex expression", () => {
    const result = evaluate("2 + add(3, 4)", testFunctions);
    expect(result).toBe(9);
  });

  test("evaluate function with whitespace", () => {
    const result = evaluate("max( 1 , 2 )", testFunctions);
    expect(result).toBe(2);
  });

  test("error on unknown function", () => {
    expect(() => evaluate("unknown(1, 2)", testFunctions)).toThrow(
      "Unknown function: unknown"
    );
  });

  test("error when function throws", () => {
    const badFunctions = {
      fail: () => {
        throw new Error("Test error");
      },
    };
    expect(() => evaluate("fail()", badFunctions)).toThrow(
      "Error calling function fail"
    );
  });
});

describe("Integration tests", () => {
  test("complex nested expression", () => {
    const result = evaluate(
      "pow(2, 3) + abs(-5) * min(1, 2)",
      testFunctions
    );
    expect(result).toBe(13); // 8 + 5 * 1 = 13
  });

  test("deeply nested function calls", () => {
    const result = evaluate(
      "max(max(max(1, 2), max(3, 4)), max(5, 6))",
      testFunctions
    );
    expect(result).toBe(6);
  });

  test("mixed operations and functions", () => {
    const result = evaluate(
      "(max(10, 20) + min(5, 3)) * abs(-2)",
      testFunctions
    );
    expect(result).toBe(46); // (20 + 3) * 2 = 46
  });

  test("function calls without registry throws error", () => {
    expect(() => evaluate("max(1, 2)")).toThrow("Unknown function: max");
  });
});