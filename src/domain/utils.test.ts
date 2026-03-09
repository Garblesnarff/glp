import { describe, expect, test } from "bun:test";
import { calculateProteinTargetRange, getDaysSince, getFiberRampTarget } from "./utils";

describe("domain utils", () => {
  test("calculates protein targets from current weight using 1.2-1.5 g/kg", () => {
    expect(calculateProteinTargetRange(180)).toEqual({ min: 98, max: 122 });
  });

  test("uses a gentle fiber ramp in weeks 1-2 and full target by week 5", () => {
    const early = getFiberRampTarget(28, "2026-03-01", new Date("2026-03-08T12:00:00"));
    const late = getFiberRampTarget(28, "2026-01-15", new Date("2026-03-08T12:00:00"));

    expect(early.currentTarget).toBe(18);
    expect(early.stageLabel).toBe("Gentle ramp");
    expect(late.currentTarget).toBe(28);
    expect(late.stageLabel).toBe("Full target");
  });

  test("treats YYYY-MM-DD inputs as local calendar days for day math", () => {
    expect(getDaysSince("2026-03-07", new Date("2026-03-08T00:30:00-06:00"))).toBe(1);
  });
});
