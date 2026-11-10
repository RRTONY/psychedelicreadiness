import { describe, expect, it } from "vitest";
import { UNREVIEWED_SAFETY_WARNING, computeScores, getHardStops, isComplete, HARD_STOP_CLEAR_MIN, getMedicineWithSafety, READINESS_LEVELS, TAG_CLASS, DEFAULT_TAG_CLASS } from "@/lib/content/pri-shared";
import { MEDICINES, QUESTIONS, DIMS } from "@/lib/content/pri-data";
import { SAFETY_DATA } from "@/lib/content/pri-safety-data";

const all = (v: number) => new Array(QUESTIONS.length).fill(v);
const med = (id: string) => MEDICINES.find((m) => m.id === id)!;

describe("getMedicineWithSafety", () => {
  it("merges a medicine's real safety data", () => {
    const m = getMedicineWithSafety(med("psilocybin"));
    expect(m.name).toBe("Psilocybin Mushrooms");
    expect(m.contraindications).toEqual(SAFETY_DATA.psilocybin.contraindications);
  });

  it("gives a medicine without safety data empty lists, a clear not-reviewed warning and safetyReviewed=false", () => {
    const m = getMedicineWithSafety({ ...med("kanna"), safetyWarning: undefined });
    expect(m.safetyReviewed).toBe(false);
    expect(m.contraindications).toEqual([]);
    expect(m.sideEffects).toEqual([]);
    expect(m.drugInteractions).toEqual([]);
    expect(m.safetyWarning).toBe(UNREVIEWED_SAFETY_WARNING);
    expect(getMedicineWithSafety(med("psilocybin")).safetyReviewed).toBe(true);
    // Kanna's own card text is its warning while the lists stay unreviewed.
    expect(getMedicineWithSafety(med("kanna")).safetyWarning).toBe(med("kanna").safetyWarning);
  });
});

describe("READINESS_LEVELS", () => {
  it("runs from 85 down to 0", () => {
    expect(READINESS_LEVELS.map((l) => l.threshold)).toEqual([85, 70, 55, 40, 0]);
  });
});

describe("computeScores", () => {
  it("scores every dimension and the overall from the 1-10 slider answers (x10)", () => {
    const r = computeScores(all(10));
    for (const d of DIMS) expect(r.dimScores[d]).toBe(100);
    expect(r.overall).toBe(100);
    expect(r.level.label).toBe("Ready to Go Deep");
    expect(r.sequence[0].name).toBe("Psilocybin (Facilitated Ceremony)");
  });

  it("averages each dimension's own questions", () => {
    const answers = QUESTIONS.map((q) => (q.dim === "medical" ? 8 : 4));
    const r = computeScores(answers);
    expect(r.dimScores.medical).toBe(80);
    expect(r.dimScores.integration).toBe(40);
    expect(r.overall).toBe(Math.round((80 + 40 * 5) / 6));
  });

  it("picks the readiness level and healing sequence for middle and low answers", () => {
    const mid = computeScores(all(6));
    expect(mid.overall).toBe(60);
    expect(mid.level.label).toBe("Building Toward It");
    expect(mid.sequence[0].name).toBe("Holotropic Breathwork");
    const low = computeScores(all(1));
    expect(low.overall).toBe(10);
    expect(low.level.label).toBe("Start Here");
    expect(low.sequence[0].name).toBe("Ceremonial Cacao + Intention");
  });

  it("returns the 6 best matches, sorted, each within 0-100", () => {
    const r = computeScores(all(5));
    expect(r.topMatches).toHaveLength(6);
    for (let i = 1; i < 6; i++) expect(r.topMatches[i - 1].matchScore).toBeGreaterThanOrEqual(r.topMatches[i].matchScore);
    for (const m of r.topMatches) {
      expect(m.matchScore).toBeGreaterThanOrEqual(0);
      expect(m.matchScore).toBeLessThanOrEqual(100);
    }
  });

  it("puts gentle medicines first for a low-readiness answer set", () => {
    const ids = computeScores(all(1)).topMatches.map((m) => m.id);
    expect(ids).toContain("cacao");
    expect(ids).not.toContain("ayahuasca");
  });

  // Fixed 2026-10-16: matchScore used to be round(sum of 6 dims, each at most
  // 10) / 5, so it never passed 12, yet the results page labels 60%+ "worth a
  // real look" and 80%+ "this one knows you".
  it("lets medicine match scores reach the 60%/80% labels", () => {
    const best = Math.max(...[1, 5, 10].flatMap((v) => computeScores(all(v)).topMatches.map((m) => m.matchScore)));
    expect(best).toBeGreaterThanOrEqual(60);
  });

  // Brugmansia and Datura are "Hard Stop" deliriants ("NOT A PSYCHEDELIC.
  // Listed to protect you."): fixed 2026-10-16 to keep them out of the matches.
  it("never recommends a 'Hard Stop' deliriant as a top match", () => {
    const ids = computeScores(all(10)).topMatches.map((m) => m.id);
    expect(ids.filter((id) => med(id).complexityLevel === "Hard Stop")).toEqual([]);
  });

  it("gives a real overall score with fewer answers than questions", () => {
    expect(Number.isNaN(computeScores([]).overall)).toBe(false);
  });
});

describe("TAG_CLASS", () => {
  it("has full literal classes, with a default for other tags", () => {
    for (const cls of Object.values(TAG_CLASS)) expect(cls).toMatch(/^border-\S+ text-\S+$/);
    expect(DEFAULT_TAG_CLASS).toBe("border-pri-border text-pri-tan");
  });
});

// 2026-11-11 audit: a profile with one negative cardiac answer and every other answer at 10 got
// 99/100 overall and an 87/100 ibogaine match. Hard-stop answers now pause the scores.
describe("hard stops and complete answers", () => {
  const hardStopIdx = QUESTIONS.flatMap((q, i) => (q.severity === "hard_stop" ? [i] : []));
  const cardiac = QUESTIONS.findIndex((q) => q.text.startsWith("I have no history of heart attack"));

  it("has the 14 hard-stop statements the review describes", () => {
    expect(hardStopIdx).toHaveLength(14);
    expect(QUESTIONS[cardiac].severity).toBe("hard_stop");
  });

  it("flags the audit profile's negative cardiac answer", () => {
    const answers = QUESTIONS.map((_, i) => (i === cardiac ? 1 : 10));
    const r = computeScores(answers);
    expect(r.hardStops.map((q) => q.text)).toEqual([QUESTIONS[cardiac].text]);
  });

  it("clears a hard stop only at the threshold or above", () => {
    expect(HARD_STOP_CLEAR_MIN).toBe(7);
    const at = (v: number) => getHardStops(QUESTIONS.map((_, i) => (i === cardiac ? v : 10)));
    expect(at(HARD_STOP_CLEAR_MIN)).toEqual([]);
    expect(at(HARD_STOP_CLEAR_MIN - 1)).toHaveLength(1);
    expect(computeScores(all(10)).hardStops).toEqual([]);
    expect(computeScores(all(5)).hardStops).toHaveLength(14);
  });

  it("treats a missing or non-numeric hard-stop answer as not cleared", () => {
    const answers: (number | null)[] = all(10);
    answers[cardiac] = null;
    expect(getHardStops(answers)).toHaveLength(1);
    expect(getHardStops([])).toHaveLength(14);
    const nan = all(10);
    nan[cardiac] = Number.NaN;
    expect(getHardStops(nan)).toHaveLength(1);
  });

  it("isComplete needs an explicit number for every question", () => {
    expect(isComplete(all(5))).toBe(true);
    expect(isComplete(new Array(QUESTIONS.length).fill(null))).toBe(false);
    const one: (number | null)[] = all(5);
    one[QUESTIONS.length - 1] = null;
    expect(isComplete(one)).toBe(false);
    expect(isComplete(all(5).slice(1))).toBe(false);
  });
});
