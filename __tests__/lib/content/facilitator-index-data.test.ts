import { describe, expect, it } from "vitest";
import {
  FACILITATOR_HERO_IMAGE, FACILITATOR_BANDS_IMAGE, FACILITATOR_COMPASS_IMAGE, QUICK_QUESTIONS, SCALE_LABELS,
  FACILITATOR_BANDS, deriveArchetype,
} from "@/lib/content/facilitator-index-data";

const fill = (ids: string[], v: number) => Object.fromEntries(ids.map((id) => [id, v]));

describe("facilitator-index data", () => {
  it("hosts its images on Sanity, never Manus", () => {
    for (const url of [FACILITATOR_HERO_IMAGE, FACILITATOR_BANDS_IMAGE, FACILITATOR_COMPASS_IMAGE]) {
      expect(url).toMatch(/^https:\/\/cdn\.sanity\.io\/images\//);
      expect(url).not.toMatch(/manuscdn|\/manus-storage\/|\/api\/img\//);
    }
  });

  it("has 15 quick questions q1..q15, each with two scale labels", () => {
    expect(QUICK_QUESTIONS.map((q) => q.id)).toEqual(Array.from({ length: 15 }, (_, i) => `q${i + 1}`));
    expect(Object.keys(SCALE_LABELS).sort()).toEqual(QUICK_QUESTIONS.map((q) => q.id).sort());
    for (const [low, high] of Object.values(SCALE_LABELS)) expect(low && high).toBeTruthy();
  });

  it("has Band 0 plus bands A..L with unique ids", () => {
    expect(FACILITATOR_BANDS.map((b) => b.id)).toEqual(["band-0", ..."abcdefghijkl".split("").map((c) => `band-${c}`)]);
    for (const b of FACILITATOR_BANDS) expect(b.title.trim()).not.toBe("");
  });

  it("numbers the 108 items 1..108 in order across the bands", () => {
    const nums = FACILITATOR_BANDS.flatMap((b) => b.items.map((i) => i.n));
    expect(nums).toEqual(Array.from({ length: 108 }, (_, i) => i + 1));
    for (const b of FACILITATOR_BANDS) for (const i of b.items) expect(i.text.trim()).not.toBe("");
  });

  it("numbers traditions 1..n where a band has them", () => {
    const withTraditions = FACILITATOR_BANDS.filter((b) => b.traditions?.length);
    expect(withTraditions.length).toBeGreaterThan(0);
    for (const b of withTraditions) expect(b.traditions!.map((t) => t.n)).toEqual(b.traditions!.map((_, i) => i + 1));
  });
});

describe("deriveArchetype", () => {
  it("treats every unanswered question as a 5 and returns The Integrative Guide", () => {
    const a = deriveArchetype({});
    expect(a.title).toBe("The Integrative Guide");
    expect(a.bands.map((b) => [b.label, b.score])).toEqual([
      ["Philosophy", 5], ["Temperament", 5], ["The Map", 5], ["Container", 5], ["Experience", 5], ["Supervision", 5],
    ]);
  });

  it("returns The Threshold Keeper for philosophical, spirit-centred, emergent answers", () => {
    const a = deriveArchetype({ q3: 10, q4: 10, q5: 0, q6: 0, ...fill(["q9", "q10", "q11", "q12", "q13"], 0) });
    expect(a.title).toBe("The Threshold Keeper");
    expect(a.bands[0]).toMatchObject({ label: "Philosophy", score: 10 });
  });

  it("returns The Precision Architect for protocolised, mechanism, verbal answers", () => {
    expect(deriveArchetype(fill(["q9", "q10", "q11", "q12", "q13"], 9)).title).toBe("The Precision Architect");
  });

  it("returns The Body Oracle for somatic, warm, emergent answers", () => {
    expect(deriveArchetype({ q10: 0, q7: 10, q8: 10 }).title).toBe("The Body Oracle");
  });

  it("returns The Circle Weaver for community, warm, philosophical answers", () => {
    expect(deriveArchetype({ q3: 10, q4: 10, q5: 0, q6: 0, q7: 10, q8: 10, q11: 9, q12: 10 }).title).toBe("The Circle Weaver");
  });

  it("returns The Elder in Motion for seasoned, supervised, philosophical answers", () => {
    expect(deriveArchetype({ q1: 8, q2: 8, q3: 10, q4: 10, q5: 0, q6: 0, q11: 9 }).title).toBe("The Elder in Motion");
  });

  it("returns The Emerging Technician for structured, early-career answers", () => {
    expect(deriveArchetype({ q1: 2, q9: 8, q10: 2, q11: 8, q12: 8, q13: 8 }).title).toBe("The Emerging Technician");
  });
});
