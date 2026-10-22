import { describe, expect, it } from "vitest";
import {
  COMPASS_INTRO, COMPASS_FORMULA, COMPASS_DIMENSIONS, COMPASS_RANK_MULTIPLIERS, COMPASS_QUESTIONS, COMPASS_SUBSTANCE_ROUTING,
  COMPASS_HARD_FILTERS, COMPASS_SCENARIOS, COMPASS_SOURCES, COMPASS_REQUIRED_READING,
} from "@/lib/content/pri-iboga-compass-data";
import { DIMENSION_KEYS, DIMENSION_LABELS, applyPriorityRank, type DimensionKey } from "@/lib/content/pri-iboga-compass-engine";
import { SUBSTANCE_BONUSES } from "@/lib/content/pri-iboga-facility-data";

const QUESTIONS = COMPASS_QUESTIONS.flatMap((s) => s.questions);

describe("pri-iboga-compass-data", () => {
  it("documents the same 10 dimensions, in order, that the engine scores", () => {
    expect(COMPASS_DIMENSIONS.map((d) => d.num)).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]);
    expect(COMPASS_DIMENSIONS.map((d) => d.dimension)).toEqual(DIMENSION_KEYS.map((k) => DIMENSION_LABELS[k]));
  });

  it("documents the rank multipliers the engine applies", () => {
    const weights = Object.fromEntries(DIMENSION_KEYS.map((k) => [k, 0.1])) as Record<DimensionKey, number>;
    const ranked = applyPriorityRank(weights, [...DIMENSION_KEYS]);
    const ratios = DIMENSION_KEYS.map((k) => ranked[k] / ranked.specialtyFit);
    COMPASS_RANK_MULTIPLIERS.forEach((row, i) => expect(ratios[i]).toBeCloseTo(Number(row.multiplier.slice(1)), 10));
  });

  it("has 28 questions Q1..Q28 across 10 sections, each with options", () => {
    expect(COMPASS_QUESTIONS.map((s) => s.sectionNum)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(QUESTIONS.map((q) => q.id)).toEqual(Array.from({ length: 28 }, (_, i) => `Q${i + 1}`));
    for (const q of QUESTIONS) {
      expect(q.text.trim()).not.toBe("");
      expect(q.options.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("offers one Q3 substance option per engine substance key, and one routing row each", () => {
    expect(QUESTIONS.find((q) => q.id === "Q3")?.options).toHaveLength(SUBSTANCE_BONUSES.length);
    expect(COMPASS_SUBSTANCE_ROUTING).toHaveLength(SUBSTANCE_BONUSES.length);
  });

  it("shows the routing table's bonus numbers exactly as the engine applies them", () => {
    COMPASS_SUBSTANCE_ROUTING.forEach((row, i) => {
      const shown = [...row.facilities.matchAll(/\+(\d+)/g)].map((m) => Number(m[1]));
      const applied = SUBSTANCE_BONUSES[i].facilityBonuses.map((b) => b.bonus);
      expect({ substance: row.substance, bonuses: shown.slice(0, applied.length) }).toEqual({ substance: row.substance, bonuses: applied });
    });
  });

  it("marks the pregnancy options as excluding all facilities", () => {
    const q9 = QUESTIONS.find((q) => q.id === "Q9")!;
    expect(q9.options[1]).toMatch(/EXCLUDES ALL FACILITIES/);
    expect(q9.options[2]).toMatch(/EXCLUDES ALL FACILITIES/);
    expect(COMPASS_HARD_FILTERS[0].filter).toBe("EXCLUDE ALL");
  });

  it("has intro copy, the formula, scenarios and https or internal reading links", () => {
    expect(COMPASS_INTRO).toBeTruthy();
    expect(COMPASS_FORMULA).toContain("capped at 100");
    for (const s of COMPASS_SCENARIOS) expect(s.results.length).toBeGreaterThan(0);
    for (const s of COMPASS_SOURCES) expect(s.url).toMatch(/^https:\/\//);
    for (const r of COMPASS_REQUIRED_READING) expect(r.url).toMatch(/^(https:\/\/|\/)/);
  });
});
