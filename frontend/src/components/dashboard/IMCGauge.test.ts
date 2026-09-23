// Feature: weight-tracking, Property 9: IMC calculation produces a positive finite number
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { calculateIMC } from "./IMCGauge";

/**
 * Validates: IMC gauge UI requirement
 * Property 9: IMC calculation produces a positive finite number
 *
 * For any weight w in [1, 300] kg and height h in [50, 300] cm,
 * calculateIMC(w, h) must return a positive, finite, non-NaN number.
 */
describe("IMCGauge — calculateIMC", () => {
  it("Property 9: produces a positive finite number for valid inputs", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1, max: 300, noNaN: true }),
        fc.float({ min: 50, max: 300, noNaN: true }),
        (weight, height) => {
          const result = calculateIMC(weight, height);
          expect(Number.isFinite(result)).toBe(true);
          expect(result).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("unit: calculateIMC(70, 175) ≈ 22.86 (Normal zone)", () => {
    expect(calculateIMC(70, 175)).toBeCloseTo(22.86, 1);
  });

  it("unit: calculateIMC(50, 170) ≈ 17.3 (Abaixo do peso zone)", () => {
    expect(calculateIMC(50, 170)).toBeCloseTo(17.3, 1);
  });
});
