import { test, expect, describe } from "vitest";
import { evaluateExpression } from "./expression.js";

describe("Expression Language", () => {
  describe("Integer Literals", () => {
    test("should evaluate positive integer", () => {
      expect(evaluateExpression("42")).toBe(42);
    });

    test("should evaluate zero", () => {
      expect(evaluateExpression("0")).toBe(0);
    });

    test("should evaluate negative integer with unary minus", () => {
      expect(evaluateExpression("-5")).toBe(-5);
    });
  });

  describe("Addition", () => {
    test("should add two positive numbers", () => {
      expect(evaluateExpression("2 + 3")).toBe(5);
    });

    test("should add multiple numbers", () => {
      expect(evaluateExpression("1 + 2 + 3 + 4")).toBe(10);
    });

    test("should add negative numbers", () => {
      expect(evaluateExpression("-5 + 3")).toBe(-2);
    });
  });

  describe("Subtraction", () => {
    test("should subtract two numbers", () => {
      expect(evaluateExpression("10 - 3")).toBe(7);
    });

    test("should handle multiple subtractions", () => {
      expect(evaluateExpression("20 - 5 - 3")).toBe(12);
    });

    test("should result in negative number", () => {
      expect(evaluateExpression("5 - 10")).toBe(-5);
    });
  });

  describe("Multiplication", () => {
    test("should multiply two numbers", () => {
      expect(evaluateExpression("4 * 5")).toBe(20);
    });

    test("should multiply multiple numbers", () => {
      expect(evaluateExpression("2 * 3 * 4")).toBe(24);
    });

    test("should multiply with negative number", () => {
      expect(evaluateExpression("-3 * 4")).toBe(-12);
    });

    test("should multiply negative numbers", () => {
      expect(evaluateExpression("-3 * -4")).toBe(12);
    });
  });

  describe("Division", () => {
    test("should divide two numbers", () => {
      expect(evaluateExpression("20 / 4")).toBe(5);
    });

    test("should perform integer division", () => {
      expect(evaluateExpression("7 / 2")).toBe(3);
    });

    test("should handle multiple divisions", () => {
      expect(evaluateExpression("100 / 5 / 2")).toBe(10);
    });

    test("should throw error on division by zero", () => {
      expect(() => evaluateExpression("5 / 0")).toThrow("Division by zero");
    });
  });

  describe("Operator Precedence", () => {
    test("should prioritize multiplication over addition", () => {
      expect(evaluateExpression("2 + 3 * 4")).toBe(14);
    });

    test("should prioritize division over subtraction", () => {
      expect(evaluateExpression("10 - 6 / 2")).toBe(7);
    });

    test("should evaluate left to right for same precedence", () => {
      expect(evaluateExpression("10 - 3 - 2")).toBe(5);
    });

    test("should handle complex precedence", () => {
      expect(evaluateExpression("2 + 3 * 4 - 5 / 5")).toBe(13);
    });
  });

  describe("Parentheses/Braces", () => {
    test("should respect parentheses", () => {
      expect(evaluateExpression("(2 + 3) * 4")).toBe(20);
    });

    test("should handle nested parentheses", () => {
      expect(evaluateExpression("((2 + 3) * 4)")).toBe(20);
    });

    test("should handle multiple parentheses groups", () => {
      expect(evaluateExpression("(2 + 3) * (4 + 1)")).toBe(25);
    });

    test("should override precedence with parentheses", () => {
      expect(evaluateExpression("2 * (3 + 4)")).toBe(14);
    });

    test("should handle deeply nested parentheses", () => {
      expect(evaluateExpression("(1 + (2 * (3 + 4)))")).toBe(15);
    });
  });

  describe("Complex Expressions", () => {
    test("should evaluate expression with all operators", () => {
      expect(evaluateExpression("10 + 2 * 6 - 4 / 2")).toBe(20);
    });

    test("should evaluate expression with parentheses and all operators", () => {
      expect(evaluateExpression("(10 + 2) * (6 - 4) / 2")).toBe(12);
    });

    test("should handle unary minus in complex expression", () => {
      expect(evaluateExpression("-5 + 3 * 2")).toBe(1);
    });

    test("should handle unary minus with parentheses", () => {
      expect(evaluateExpression("-(5 + 3)")).toBe(-8);
    });

    test("should handle whitespace variations", () => {
      expect(evaluateExpression("  10  +  2  *  3  ")).toBe(16);
    });
  });

  describe("Error Handling", () => {
    test("should throw error on invalid character", () => {
      expect(() => evaluateExpression("2 + a")).toThrow("Invalid character");
    });

    test("should throw error on unmatched parentheses", () => {
      expect(() => evaluateExpression("(2 + 3")).toThrow();
    });

    test("should throw error on missing operand", () => {
      expect(() => evaluateExpression("2 +")).toThrow();
    });
  });
});
