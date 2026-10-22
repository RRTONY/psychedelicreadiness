import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as mod from "@/lib/content/pri-iboga-module";
import {
  IBOGA_IMAGES, IBOGAINE_PHARMACOLOGY, ALKALOID_COMPARISON, HEAD_TO_HEAD, IBOGAINE_OUTCOMES, IBOGA_PHARMA_ALTERNATIVES,
  IBOGA_SUPPLEMENT_STACKS, IBOGA_DIM_SCORES, IBOGA_MEDICINE_SELECTOR, IBOGA_SOURCES, IBOGA_META, IBOGA_DISCLAIMER,
} from "@/lib/content/pri-iboga-module";

describe("pri-iboga-module", () => {
  it("hosts every image on Sanity and has no Manus URL anywhere", () => {
    for (const url of Object.values(IBOGA_IMAGES)) expect(url).toMatch(/^https:\/\/cdn\.sanity\.io\/images\//);
    expect(JSON.stringify(mod)).not.toMatch(/manuscdn|\/manus-storage\/|\/api\/img\//);
  });

  it("points its slug at the real page", () => {
    expect(IBOGA_META.slug).toBe("/iboga-ibogaine");
    expect(existsSync(path.join(process.cwd(), "src/app", IBOGA_META.slug, "page.tsx"))).toBe(true);
  });

  it("has filled pharmacology, alkaloid, comparison, outcome and alternative tables", () => {
    for (const table of [IBOGAINE_PHARMACOLOGY, ALKALOID_COMPARISON, HEAD_TO_HEAD, IBOGAINE_OUTCOMES, IBOGA_PHARMA_ALTERNATIVES]) {
      expect(table.length).toBeGreaterThan(0);
      for (const row of table) for (const v of Object.values(row)) if (typeof v === "string") expect(v.trim()).not.toBe("");
    }
    expect(IBOGAINE_PHARMACOLOGY[0].receptor).toBe("NMDA (glutamate)");
    expect(ALKALOID_COMPARISON[0].alkaloid).toBe("Ibogaine");
  });

  it("has PRE, DAY-OF and POST supplement phases with https or empty search links", () => {
    expect(IBOGA_SUPPLEMENT_STACKS[0].phase).toBe("PRE");
    for (const phase of IBOGA_SUPPLEMENT_STACKS) {
      expect(phase.items.length).toBeGreaterThan(0);
      for (const item of phase.items) expect(item.searchUrl === "" || /^https:\/\//.test(item.searchUrl)).toBe(true);
    }
  });

  it("has 5 dimension rows and a medicine selector with icons", () => {
    expect(IBOGA_DIM_SCORES.map((d) => d.dimension)).toEqual(["Mental", "Emotional", "Physical", "Set & Setting", "Spiritual"]);
    for (const row of [...IBOGA_DIM_SCORES, ...IBOGA_MEDICINE_SELECTOR]) expect(row.icon).toBeTruthy();
    expect(IBOGA_MEDICINE_SELECTOR[1]).toMatchObject({ medicine: "Ibogaine HCl", addiction: "Best" });
  });

  it("lists sources and leads the disclaimer with NOT MEDICAL ADVICE", () => {
    expect(IBOGA_SOURCES.length).toBeGreaterThan(5);
    expect(IBOGA_DISCLAIMER).toMatch(/^NOT MEDICAL ADVICE\./);
  });
});
