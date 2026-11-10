import { describe, expect, it } from "vitest";
import { ACKNOWLEDGE, COUNCIL_REMINDER, DISCLAIMER_PATH, WHAT_THIS_IS } from "@/lib/content/pri-disclaimer";

describe("pri-disclaimer", () => {
  it("carries the approved council reminder wording", () => {
    expect(COUNCIL_REMINDER.title).toBe("Talk to your psychedelic council.");
    expect(COUNCIL_REMINDER.body).toBe("A rough guide from the database. No medical clearance. Review personal risks with a licensed clinician.");
    expect(DISCLAIMER_PATH).toBe("/disclaimer");
  });

  it("uses the rewritten evidence bullet, not the old cross-referenced claim", () => {
    expect(WHAT_THIS_IS.items).toHaveLength(5);
    expect(WHAT_THIS_IS.items[1]).toMatch(/^The database brings together clinical literature/);
    expect(WHAT_THIS_IS.items.join(" ")).not.toMatch(/cross-referenced/);
    expect(ACKNOWLEDGE.items).toHaveLength(7);
  });
});
