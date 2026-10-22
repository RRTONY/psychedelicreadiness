import { describe, expect, it } from "vitest";
import {
  DIMENSION_KEYS, DIMENSION_LABELS, computeWeightDeltas, computeHardFilters, getSubstanceBonuses, applyPriorityRank,
  scoreAllFacilities, getInitialRankOrder, type DimensionKey,
} from "@/lib/content/pri-iboga-compass-engine";
import { FACILITIES } from "@/lib/content/pri-iboga-facility-data";

const uniform = () => Object.fromEntries(DIMENSION_KEYS.map((k) => [k, 0.1])) as Record<DimensionKey, number>;
const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

describe("computeWeightDeltas", () => {
  it("is all zeros with no answers", () => {
    expect(Object.values(computeWeightDeltas({})).every((v) => v === 0)).toBe(true);
    expect(Object.keys(computeWeightDeltas({}))).toEqual([...DIMENSION_KEYS]);
  });

  it("shifts weight toward safety for substance dependency and toward Bwiti for spiritual work", () => {
    const dep = computeWeightDeltas({ Q1: 0 });
    expect(dep.medicalSafety).toBeCloseTo(0.05);
    expect(dep.clinicalTrackRecord).toBeCloseTo(0.04);
    const spirit = computeWeightDeltas({ Q1: 3 });
    expect(spirit.bwitiAuthenticity).toBeCloseTo(0.06);
    expect(spirit.nagoyaReciprocity).toBeCloseTo(0.04);
  });

  it("boosts access & intake for someone who needs help within 30 days", () => {
    expect(computeWeightDeltas({ Q2: 0 }).accessIntake).toBeCloseTo(0.05);
  });
});

describe("computeHardFilters", () => {
  it("has no filters with no answers", () => {
    expect(computeHardFilters({})).toEqual({
      excludeAll: false, minMedicalSafety: 0, topRatedOnly: false, maxBudget: 0, maxDays: 0, excludeGabon: false,
      excludeEurope: false, excludeCostaRica: false, veganOnly: false, familyRequired: false, veteranBoost: false,
    });
  });

  it("excludes everything for pregnancy or breastfeeding only", () => {
    expect(computeHardFilters({ Q9: 1 }).excludeAll).toBe(true);
    expect(computeHardFilters({ Q9: 2 }).excludeAll).toBe(true);
    expect(computeHardFilters({ Q9: 3 }).excludeAll).toBe(false);
  });

  it("keeps the strictest medical-safety minimum across answers", () => {
    expect(computeHardFilters({ Q4: 1 }).minMedicalSafety).toBe(7);
    expect(computeHardFilters({ Q4: 1, Q27: 0 }).minMedicalSafety).toBe(8);
    expect(computeHardFilters({ Q4: 2, Q27: 0 }).minMedicalSafety).toBe(9);
  });

  it("maps budget, duration, travel, language, diet, family and veteran answers", () => {
    expect(computeHardFilters({ Q13: 0 }).maxBudget).toBe(5000);
    expect(computeHardFilters({ Q13: 4 }).maxBudget).toBe(0);
    expect(computeHardFilters({ Q14: 2 }).maxDays).toBe(21);
    expect(computeHardFilters({ Q16: 3 })).toMatchObject({ excludeGabon: true, excludeEurope: true, excludeCostaRica: true });
    expect(computeHardFilters({ Q16: 2 })).toMatchObject({ excludeGabon: true, excludeEurope: true, excludeCostaRica: false });
    expect(computeHardFilters({ Q17: 0 }).excludeGabon).toBe(true);
    expect(computeHardFilters({ Q24: 0, Q25: 0, Q19: 0 })).toMatchObject({ veganOnly: true, familyRequired: true, veteranBoost: true });
    expect(computeHardFilters({ Q7: 2 }).topRatedOnly).toBe(true);
  });
});

describe("getSubstanceBonuses", () => {
  it("is empty without Q3 and for out-of-range picks", () => {
    expect(getSubstanceBonuses({})).toEqual({});
    expect(getSubstanceBonuses({ Q3: [99] })).toEqual({});
  });

  it("adds up the bonuses for every selected substance", () => {
    expect(getSubstanceBonuses({ Q3: [1] })).toEqual({ dardashti: 10, ambio: 5, "new-roots": 4 });
    const both = getSubstanceBonuses({ Q3: [0, 1] });
    expect(both.dardashti).toBe(15);
    expect(both.ambio).toBe(10);
  });
});

describe("applyPriorityRank", () => {
  it("normalises weights to 1 and doubles the first-ranked dimension relative to the fifth", () => {
    const ranked = applyPriorityRank(uniform(), [...DIMENSION_KEYS]);
    expect(sum(ranked)).toBeCloseTo(1, 10);
    expect(ranked.medicalSafety / ranked.specialtyFit).toBeCloseTo(2.0, 10);
    expect(ranked.reputation / ranked.specialtyFit).toBeCloseTo(0.5, 10);
  });

  it("only normalises when no rank order is given", () => {
    const ranked = applyPriorityRank(uniform(), []);
    for (const k of DIMENSION_KEYS) expect(ranked[k]).toBeCloseTo(0.1, 10);
  });
});

describe("scoreAllFacilities", () => {
  it("scores every facility 0-100, eligible ones first, by score", () => {
    const results = scoreAllFacilities({}, [...DIMENSION_KEYS]);
    expect(results).toHaveLength(FACILITIES.length);
    expect(results.every((r) => !r.eliminated)).toBe(true);
    for (let i = 1; i < results.length; i++) expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    for (const r of results) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
      expect(Math.abs(r.matchPercent - r.score)).toBeLessThanOrEqual(0.5);
      expect(r.topDimensions).toHaveLength(3);
      expect(r.whyMatched).toMatch(/^Strongest match on /);
    }
  });

  it("eliminates every facility for pregnancy", () => {
    const results = scoreAllFacilities({ Q9: 1 }, []);
    expect(results.every((r) => r.eliminated && /pregnancy/.test(r.eliminationReason ?? ""))).toBe(true);
  });

  it("drops facilities over budget, below the safety minimum and in Gabon, and lists them last", () => {
    const results = scoreAllFacilities({ Q13: 0, Q4: 2, Q17: 0 }, []);
    for (const r of results) {
      const f = r.facility;
      const shouldPass = f.medicalSafety >= 9 && f.priceMin <= 5000 && f.region !== "gabon";
      expect({ id: f.id, eliminated: r.eliminated }).toEqual({ id: f.id, eliminated: !shouldPass });
    }
    const firstEliminated = results.findIndex((r) => r.eliminated);
    expect(results.slice(firstEliminated).every((r) => r.eliminated)).toBe(true);
    expect(results.find((r) => r.facility.id === "ambio")?.eliminationReason).toMatch(/exceeds budget cap of \$5,000/);
  });

  it("adds 15 points for veteran-focused facilities when the visitor is a veteran", () => {
    const vet = FACILITIES.find((f) => f.veteranFocus)!;
    const base = scoreAllFacilities({}, []).find((r) => r.facility.id === vet.id)!;
    const boosted = scoreAllFacilities({ Q19: 0 }, []).find((r) => r.facility.id === vet.id)!;
    expect(boosted.score).toBeCloseTo(Math.min(100, base.score + 15), 1);
    expect(boosted.whyMatched).toContain("veteran-focused program");
  });

  it("adds the substance bonus to a facility's score", () => {
    const base = scoreAllFacilities({}, []).find((r) => r.facility.id === "dardashti")!;
    const withBonus = scoreAllFacilities({ Q3: [1] }, []).find((r) => r.facility.id === "dardashti")!;
    expect(withBonus.score).toBeCloseTo(Math.min(100, base.score + 10), 1);
    expect(withBonus.whyMatched).toContain("top-tier substance specialty match");
  });
});

describe("getInitialRankOrder", () => {
  it("returns all 10 dimensions, highest weight first, keeping the default order on ties", () => {
    expect(getInitialRankOrder({})).toEqual([...DIMENSION_KEYS]);
    const order = getInitialRankOrder({ Q1: 3 });
    expect(order.slice(0, 2)).toEqual(["bwitiAuthenticity", "nagoyaReciprocity"]);
    expect(new Set(order).size).toBe(10);
  });

  it("labels every dimension", () => {
    for (const k of DIMENSION_KEYS) expect(DIMENSION_LABELS[k].trim()).not.toBe("");
  });
});

const nonZero = (o: Record<string, number>) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => Math.abs(v) > 1e-12).map(([k, v]) => [k, Math.round(v * 1000) / 1000]));

describe("computeWeightDeltas: every answer that moves a weight", () => {
  const cases: [Record<string, number>, Record<string, number>][] = [
    [{ Q1: 1 }, { integrationDepth: 0.05, clinicalTrackRecord: 0.03, specialtyFit: 0.03 }],
    [{ Q1: 2 }, { medicalSafety: 0.06, clinicalTrackRecord: 0.05 }],
    [{ Q1: 4 }, { facilityQuality: 0.03, integrationDepth: 0.03 }],
    [{ Q1: 5 }, { specialtyFit: 0.05, integrationDepth: 0.03 }],
    [{ Q1: 6 }, {}],
    [{ Q2: 1 }, { accessIntake: 0.02 }],
    [{ Q2: 2 }, {}],
    [{ Q10: 0 }, { medicalSafety: 0.04, bwitiAuthenticity: -0.03 }],
    [{ Q10: 1 }, { medicalSafety: 0.03 }],
    [{ Q10: 2 }, { bwitiAuthenticity: 0.02, medicalSafety: 0.02 }],
    [{ Q10: 3 }, { bwitiAuthenticity: 0.04 }],
    [{ Q10: 4 }, { bwitiAuthenticity: 0.06, nagoyaReciprocity: 0.04, medicalSafety: -0.02 }],
    [{ Q11: 0 }, { bwitiAuthenticity: 0.06 }],
    [{ Q11: 1 }, { bwitiAuthenticity: 0.04 }],
    [{ Q11: 2 }, {}],
    [{ Q11: 3 }, { medicalSafety: 0.02 }],
    [{ Q11: 4 }, { medicalSafety: 0.03 }],
    [{ Q12: 0 }, { nagoyaReciprocity: 0.06 }],
    [{ Q12: 1 }, { nagoyaReciprocity: 0.03 }],
    [{ Q13: 0 }, { costToValue: 0.06 }],
    [{ Q13: 1 }, { costToValue: 0.04 }],
    [{ Q13: 2 }, {}],
    [{ Q13: 4 }, { facilityQuality: 0.03 }],
    [{ Q21: 0 }, { facilityQuality: 0.04 }],
    [{ Q21: 1 }, { facilityQuality: 0.04 }],
    [{ Q21: 2 }, {}],
    [{ Q23: 0 }, { facilityQuality: 0.05 }],
    [{ Q23: 3 }, { bwitiAuthenticity: 0.02, costToValue: 0.02 }],
    [{ Q23: 1 }, {}],
    [{ Q26: 0 }, { integrationDepth: 0.06 }],
    [{ Q26: 1 }, { integrationDepth: 0.04 }],
    [{ Q26: 2 }, { integrationDepth: 0.02 }],
    [{ Q26: 3 }, {}],
    [{ Q27: 0 }, { medicalSafety: 0.05 }],
    [{ Q27: 1 }, {}],
    [{ Q27: 2 }, { bwitiAuthenticity: 0.02, medicalSafety: -0.02 }],
  ];
  it.each(cases)("%j moves the weights by %j", (answers, expected) => {
    expect(nonZero(computeWeightDeltas(answers))).toEqual(expected);
  });

  it("adds the deltas from several answers together", () => {
    expect(nonZero(computeWeightDeltas({ Q1: 3, Q10: 4, Q11: 0 }))).toEqual({
      bwitiAuthenticity: 0.18,
      nagoyaReciprocity: 0.08,
      medicalSafety: -0.02,
    });
  });
});

describe("computeHardFilters: medical-safety minimums and caps", () => {
  const minSafety: [Record<string, number>, number][] = [
    [{ Q4: 0 }, 0], [{ Q4: 3 }, 8],
    [{ Q5: 1 }, 9], [{ Q5: 2 }, 9], [{ Q5: 3 }, 8], [{ Q5: 0 }, 0],
    [{ Q6: 1 }, 9], [{ Q6: 2 }, 9], [{ Q6: 3 }, 8], [{ Q6: 4 }, 8], [{ Q6: 0 }, 0],
    [{ Q7: 4 }, 8], [{ Q7: 0 }, 0],
    [{ Q8: 0 }, 8], [{ Q8: 1 }, 8], [{ Q8: 2 }, 8], [{ Q8: 3 }, 9], [{ Q8: 4 }, 9], [{ Q8: 5 }, 0],
    [{ Q27: 1 }, 0],
    [{ Q5: 3, Q8: 4 }, 9],
    [{ Q6: 1, Q7: 4 }, 9],
  ];
  it.each(minSafety)("%j requires medical safety of at least %i", (answers, min) => {
    expect(computeHardFilters(answers).minMedicalSafety).toBe(min);
  });

  it("only treats psychosis/bipolar answers as 'top rated only'", () => {
    expect(computeHardFilters({ Q7: 3 }).topRatedOnly).toBe(true);
    expect(computeHardFilters({ Q7: 1 }).topRatedOnly).toBe(false);
    expect(computeHardFilters({ Q9: 0 }).excludeAll).toBe(false);
  });

  it("maps every budget and duration answer to its cap", () => {
    expect([0, 1, 2, 3, 4].map((i) => computeHardFilters({ Q13: i }).maxBudget)).toEqual([5000, 10000, 20000, 50000, 0]);
    expect([0, 1, 2, 3, 4].map((i) => computeHardFilters({ Q14: i }).maxDays)).toEqual([5, 10, 21, 60, 0]);
  });

  it("leaves travel, language, veteran, diet and family filters off for other answers", () => {
    expect(computeHardFilters({ Q16: 0, Q17: 1, Q19: 1, Q24: 1, Q25: 1 })).toMatchObject({
      excludeGabon: false, excludeEurope: false, excludeCostaRica: false, veteranBoost: false, veganOnly: false, familyRequired: false,
    });
  });
});

describe("scoreAllFacilities: elimination reasons", () => {
  const reasonFor = (answers: Record<string, number>, id: string) =>
    scoreAllFacilities(answers, []).find((r) => r.facility.id === id)!;

  it("names the safety minimum a facility missed", () => {
    const low = FACILITIES.find((f) => f.medicalSafety < 9)!;
    expect(reasonFor({ Q4: 2 }, low.id).eliminationReason).toBe(
      `Medical Safety score ${low.medicalSafety} below required minimum of 9`,
    );
  });

  it("keeps only top-rated clinics for a psychosis/bipolar profile", () => {
    const results = scoreAllFacilities({ Q7: 2 }, []);
    for (const r of results) {
      const f = r.facility;
      const fails = f.clinicalTrackRecord < 8 && f.medicalSafety < 9;
      expect({ id: f.id, eliminated: r.eliminated }).toEqual({ id: f.id, eliminated: fails });
      if (fails) expect(r.eliminationReason).toBe("Only top-rated clinics qualify for this medical profile");
    }
  });

  it("drops stays longer than the visitor's window", () => {
    const results = scoreAllFacilities({ Q14: 0 }, []);
    for (const r of results) expect(r.eliminated).toBe(r.facility.durationDays[0] > 5);
    expect(reasonFor({ Q14: 0 }, "ambio").eliminationReason).toBe("Minimum stay of 7 days exceeds your 5-day window");
  });

  it("explains geography exclusions for Gabon, Europe and Costa Rica", () => {
    expect(reasonFor({ Q16: 3 }, "bwiti-house").eliminationReason).toBe("Excluded by geography or language preference");
    expect(reasonFor({ Q16: 2 }, "tabula-rasa").eliminationReason).toBe("Excluded by North America-only preference");
    expect(reasonFor({ Q16: 3 }, "iboga-wellness").eliminationReason).toBe("Excluded by drive-distance-only preference");
    expect(reasonFor({ Q16: 2 }, "iboga-wellness").eliminated).toBe(false);
    expect(reasonFor({ Q16: 3 }, "ambio").eliminated).toBe(false);
  });

  it("drops non-vegan facilities and ones without a family program when those are required", () => {
    const vegan = scoreAllFacilities({ Q24: 0 }, []);
    for (const r of vegan) expect(r.eliminated).toBe(!r.facility.veganFriendly);
    expect(reasonFor({ Q24: 0 }, "tmw").eliminationReason).toBe("Does not accommodate strict vegan dietary requirements");
    const family = scoreAllFacilities({ Q25: 0 }, []);
    for (const r of family) expect(r.eliminated).toBe(!r.facility.familyProgram);
    expect(reasonFor({ Q25: 0 }, "tabula-rasa").eliminationReason).toBe("No family/spouse program available");
  });
});

describe("scoreAllFacilities: 'why this matched' wording", () => {
  it("describes medium and small substance bonuses differently", () => {
    const results = scoreAllFacilities({ Q3: [1] } as never, []);
    expect(results.find((r) => r.facility.id === "ambio")!.whyMatched).toContain("strong substance routing");
    expect(results.find((r) => r.facility.id === "new-roots")!.whyMatched).toContain("relevant substance experience");
    expect(results.find((r) => r.facility.id === "tmw")!.whyMatched).not.toMatch(/substance/);
  });

  it("calls out authentic Bwiti lineage and indigenous reciprocity when the visitor weighs them heavily", () => {
    const answers = { Q1: 3, Q10: 4, Q11: 0, Q12: 0 };
    const order = getInitialRankOrder(answers);
    const results = scoreAllFacilities(answers, order);
    const bwiti = results.find((r) => r.facility.bwitiAuthenticity >= 8)!;
    expect(bwiti.whyMatched).toContain("authentic Bwiti lineage");
    const nagoya = results.find((r) => r.facility.nagoyaReciprocity >= 8)!;
    expect(nagoya.whyMatched).toContain("strong indigenous reciprocity");
    // A medical-first visitor gets neither highlight.
    const medical = scoreAllFacilities({ Q10: 0, Q27: 0 }, ["medicalSafety"]);
    expect(medical.some((r) => /authentic Bwiti lineage|strong indigenous reciprocity/.test(r.whyMatched))).toBe(false);
  });

});
