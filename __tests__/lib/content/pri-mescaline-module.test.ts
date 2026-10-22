import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as mod from "@/lib/content/pri-mescaline-module";
import {
  MESCALINE_PHARMACOLOGY, LATUDA_MIRROR, LATUDA_MIRROR_ONELINER, MESCALINE_OUTCOMES, OUTCOMES_SOURCE, PHARMA_ALTERNATIVES,
  SUPPLEMENT_STACKS, MESCALINE_DIM_SCORES, MEDICINE_SELECTOR, MESCALINE_SOURCES, MESCALINE_META, MESCALINE_DISCLAIMER,
} from "@/lib/content/pri-mescaline-module";

describe("pri-mescaline-module", () => {
  it("has no Manus URL anywhere", () => {
    expect(JSON.stringify(mod)).not.toMatch(/manuscdn|\/manus-storage\/|\/api\/img\//);
  });

  it("points its slug at the real page", () => {
    expect(MESCALINE_META.slug).toBe("/peyote-mescaline");
    expect(existsSync(path.join(process.cwd(), "src/app", MESCALINE_META.slug, "page.tsx"))).toBe(true);
  });

  it("has filled pharmacology, Latuda mirror, outcomes and alternatives", () => {
    for (const table of [MESCALINE_PHARMACOLOGY, LATUDA_MIRROR, MESCALINE_OUTCOMES, PHARMA_ALTERNATIVES]) {
      expect(table.length).toBeGreaterThan(0);
      for (const row of table) for (const v of Object.values(row)) if (typeof v === "string") expect(v.trim()).not.toBe("");
    }
    expect(LATUDA_MIRROR_ONELINER).toBe("Latuda suppresses the serotonin system daily. Mescaline resets it once.");
    expect(OUTCOMES_SOURCE).toMatch(/n=452/);
  });

  it("has PRE, DAY-OF and POST-INTEGRATION supplement phases with https or empty links", () => {
    expect(SUPPLEMENT_STACKS.map((p) => p.phase)).toEqual(["PRE", "DAY-OF", "POST-INTEGRATION"]);
    for (const phase of SUPPLEMENT_STACKS) {
      for (const item of phase.items) {
        expect(item.name && item.dosage).toBeTruthy();
        expect(item.searchUrl === "" || /^https:\/\//.test(item.searchUrl)).toBe(true);
      }
    }
  });

  it("gives dimension and selector rows icons", () => {
    expect(MESCALINE_DIM_SCORES.length).toBeGreaterThan(0);
    for (const row of [...MESCALINE_DIM_SCORES, ...MEDICINE_SELECTOR]) expect(row.icon).toBeTruthy();
  });

  it("lists sources and leads the disclaimer with NOT MEDICAL ADVICE", () => {
    expect(MESCALINE_SOURCES.length).toBeGreaterThan(5);
    expect(MESCALINE_DISCLAIMER).toMatch(/^NOT MEDICAL ADVICE\./);
  });
});
