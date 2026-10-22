import { describe, expect, it } from "vitest";
import {
  DIMS, DIM_LABELS, DIM_ICONS, SLIDER_LABELS, MAOB_INTERACTIONS, MAOB_WASHOUT, MEDICATION_INTERACTIONS, SCORE_PROFILES,
  CRISIS_RESOURCES, INTEGRATION_RESOURCES, MEDICINES, QUESTIONS, PATHWAY_QUESTIONS,
} from "@/lib/content/pri-data";

describe("pri-data", () => {
  it("has the 6 dimensions, each with a label and icon", () => {
    expect(DIMS).toEqual(["medical", "pharmacological", "psychological", "intention", "setting", "integration"]);
    for (const d of DIMS) {
      expect(DIM_LABELS[d].trim()).not.toBe("");
      expect(DIM_ICONS[d]).toBeTruthy();
    }
    expect(SLIDER_LABELS).toHaveLength(5);
  });

  it("asks 50 questions, at least 6 per dimension", () => {
    expect(QUESTIONS).toHaveLength(50);
    for (const d of DIMS) expect(QUESTIONS.filter((q) => q.dim === d).length).toBeGreaterThanOrEqual(6);
    for (const q of QUESTIONS) {
      expect(q.text.trim()).not.toBe("");
      if (q.severity) expect(["hard_stop", "caution", "standard"]).toContain(q.severity);
    }
    expect(QUESTIONS.some((q) => q.severity === "hard_stop")).toBe(true);
  });

  it("has 39 medicines with unique ids and requirement weights between 0 and 1", () => {
    expect(MEDICINES).toHaveLength(39);
    expect(new Set(MEDICINES.map((m) => m.id)).size).toBe(39);
    for (const m of MEDICINES) {
      expect(m.name && m.latin && m.overview).toBeTruthy();
      expect(m.icon).toBeTruthy();
      expect(m.intensity).toBeGreaterThanOrEqual(0);
      expect(m.intensity).toBeLessThanOrEqual(1);
      for (const d of DIMS) {
        expect(m.dims[d], `${m.id}.${d}`).toBeGreaterThanOrEqual(0);
        expect(m.dims[d]).toBeLessThanOrEqual(1);
      }
    }
  });

  it("marks the two anticholinergic deliriants as Hard Stop", () => {
    for (const id of ["brugmansia", "datura"]) expect(MEDICINES.find((m) => m.id === id)?.complexityLevel).toBe("Hard Stop");
  });

  it("has 8 unique pathway questions with both scale labels", () => {
    expect(PATHWAY_QUESTIONS.map((p) => p.id)).toHaveLength(8);
    expect(new Set(PATHWAY_QUESTIONS.map((p) => p.id)).size).toBe(8);
    for (const p of PATHWAY_QUESTIONS) expect(p.lowLabel && p.highLabel).toBeTruthy();
  });

  it("lists real crisis lines, integration tiers, interactions and score profiles", () => {
    expect(CRISIS_RESOURCES.map((c) => c.contact)).toContain("Call or text 988");
    expect(INTEGRATION_RESOURCES.length).toBeGreaterThan(0);
    expect(MAOB_INTERACTIONS.length).toBeGreaterThan(0);
    expect(MAOB_WASHOUT).toBeTruthy();
    expect(MEDICATION_INTERACTIONS.length).toBeGreaterThan(0);
    for (const p of SCORE_PROFILES) expect(p.color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
