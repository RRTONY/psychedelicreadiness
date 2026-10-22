import { describe, expect, it } from "vitest";
import { FACILITIES, SUBSTANCE_BONUSES } from "@/lib/content/pri-iboga-facility-data";
import { DIMENSION_KEYS } from "@/lib/content/pri-iboga-compass-engine";

describe("pri-iboga-facility-data", () => {
  it("has 15 facilities with unique ids", () => {
    expect(FACILITIES).toHaveLength(15);
    expect(new Set(FACILITIES.map((f) => f.id)).size).toBe(15);
    expect(FACILITIES[0]).toMatchObject({ id: "ambio", name: "Ambio Life Sciences" });
  });

  it("scores every dimension from 1 to 10", () => {
    for (const f of FACILITIES) {
      for (const k of DIMENSION_KEYS) {
        expect(f[k], `${f.id}.${k}`).toBeGreaterThanOrEqual(1);
        expect(f[k]).toBeLessThanOrEqual(10);
      }
    }
  });

  it("has consistent prices and stay lengths and real https websites", () => {
    for (const f of FACILITIES) {
      expect(f.priceMin).toBeGreaterThanOrEqual(0);
      expect(f.priceMax).toBeGreaterThanOrEqual(f.priceMin);
      expect(f.durationDays[1]).toBeGreaterThanOrEqual(f.durationDays[0]);
      expect(f.website).toMatch(/^https?:\/\//);
      expect(f.website).not.toMatch(/manus/);
      expect(f.tagline.trim()).not.toBe("");
    }
  });

  it("routes substance bonuses only to real facilities, once per substance", () => {
    const ids = new Set(FACILITIES.map((f) => f.id));
    expect(new Set(SUBSTANCE_BONUSES.map((s) => s.substanceKey)).size).toBe(SUBSTANCE_BONUSES.length);
    for (const s of SUBSTANCE_BONUSES) {
      const facilityIds = s.facilityBonuses.map((b) => b.facilityId);
      expect(new Set(facilityIds).size).toBe(facilityIds.length);
      for (const b of s.facilityBonuses) {
        expect(ids.has(b.facilityId), `${s.substanceKey} -> ${b.facilityId}`).toBe(true);
        expect(b.bonus).toBeGreaterThan(0);
      }
    }
  });
});
