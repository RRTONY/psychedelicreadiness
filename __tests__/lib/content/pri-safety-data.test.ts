import { describe, expect, it } from "vitest";
import { SAFETY_DATA } from "@/lib/content/pri-safety-data";
import { MEDICINES } from "@/lib/content/pri-data";

const IDS = MEDICINES.map((m) => m.id);

describe("pri-safety-data", () => {
  it("fills every safety field for every entry", () => {
    for (const [id, s] of Object.entries(SAFETY_DATA)) {
      for (const list of [s.contraindications, s.sideEffects, s.drugInteractions]) {
        expect(list.length, id).toBeGreaterThan(0);
        for (const item of list) expect(item.trim()).not.toBe("");
      }
      expect(s.safetyWarning.trim() && s.legalStatus.trim()).toBeTruthy();
    }
  });

  it("covers the original 25 medicines; only 'breathwork' is not a medicine card", () => {
    expect(Object.keys(SAFETY_DATA).filter((id) => !IDS.includes(id))).toEqual(["breathwork"]);
    for (const id of ["psilocybin", "ayahuasca", "mdma", "ketamine", "iboga", "ibogaine", "kambo"]) expect(SAFETY_DATA[id], id).toBeDefined();
  });

  it("flags psychosis history as a psilocybin contraindication", () => {
    expect(SAFETY_DATA.psilocybin.contraindications[0]).toMatch(/psychosis/);
  });
});
