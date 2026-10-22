import { describe, expect, it } from "vitest";
import { computeScores, getMedicineWithSafety, READINESS_LEVELS, TAG_CLASS, DEFAULT_TAG_CLASS } from "@/lib/content/pri-shared";
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

  it("uses a 'data pending' placeholder for a medicine without safety data", () => {
    const m = getMedicineWithSafety(med("kanna"));
    expect(m.sideEffects).toEqual(["Data pending"]);
    expect(m.safetyWarning).toMatch(/consult a qualified healthcare professional/);
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
