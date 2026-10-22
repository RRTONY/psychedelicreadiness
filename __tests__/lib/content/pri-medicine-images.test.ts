import { describe, expect, it } from "vitest";
import { MEDICINE_IMAGES } from "@/lib/content/pri-medicine-images";
import { MEDICINES } from "@/lib/content/pri-data";

describe("pri-medicine-images", () => {
  it("only has images for real medicine ids", () => {
    const ids = MEDICINES.map((m) => m.id);
    for (const id of Object.keys(MEDICINE_IMAGES)) expect(ids).toContain(id);
    expect(Object.keys(MEDICINE_IMAGES)).toHaveLength(25);
  });

  it("hosts every image on Sanity, never Manus", () => {
    for (const url of Object.values(MEDICINE_IMAGES)) {
      expect(url).toMatch(/^https:\/\/cdn\.sanity\.io\/images\/a3q1cyqs\/production\/[0-9a-f]{40}-\d+x\d+\.(jpg|webp)$/);
      expect(url).not.toMatch(/manuscdn|\/manus-storage\/|\/api\/img\//);
    }
  });

  it("uses unique pictures", () => {
    const urls = Object.values(MEDICINE_IMAGES);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
