import { describe, expect, it, vi } from "vitest";
import { submitPriConsent, submitPriCorrection, submitFacilitatorIndex } from "@/app/forms/actions";
import { sendEmail } from "@/lib/email";

// This site has no database: each form is checked here and emailed to Tony (sendEmail is faked
// in __tests__/setup.ts and resolves true unless a test says otherwise).
const emailCall = () => vi.mocked(sendEmail).mock.calls[0] as unknown as [string, string, string];

describe("submitPriConsent", () => {
  it("needs at least two initials, and stores and emails nothing", async () => {
    await expect(submitPriConsent({ initials: "a" })).resolves.toEqual({ ok: false, error: "Type your initials to confirm." });
    await expect(submitPriConsent({ initials: " ab " })).resolves.toEqual({ ok: true });
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe("submitPriCorrection", () => {
  const ok = {
    medicineId: "iboga",
    medicineName: "Iboga",
    fieldName: "sideEffects",
    fieldLabel: "Side effects",
    suggestedContent: "Add bradycardia.",
  };

  it("emails Tony the medicine, section, current and suggested text, source and sender", async () => {
    await expect(
      submitPriCorrection({ ...ok, sourceUrl: "https://example.com/paper", submitterEmail: "a@b.co", submitterName: "Ann", currentContent: "Old text" }),
    ).resolves.toEqual({ ok: true });
    const [to, subject, html] = emailCall();
    expect(to).toBe("tony@tonygreenberg.com");
    expect(subject).toBe("PRI correction: Iboga (Side effects)");
    for (const part of ["Old text", "Add bradycardia.", "https://example.com/paper", "Ann", "a@b.co"]) expect(html).toContain(part);
    expect(html).toContain("https://psychedelicreadiness.com/");
    expect(html).not.toContain("Supabase");
  });

  it("falls back to the id and field name, and 'Anonymous', when labels are missing; escapes HTML", async () => {
    await submitPriCorrection({ ...ok, medicineName: "", fieldLabel: "", suggestedContent: "<script>x</script>" });
    const [, subject, html] = emailCall();
    expect(subject).toBe("PRI correction: iboga (sideEffects)");
    expect(html).toContain("Anonymous");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("refuses bad ids, unknown fields, empty text, bad links and bad emails", async () => {
    await expect(submitPriCorrection({ ...ok, medicineId: "Iboga!" })).resolves.toEqual({ ok: false, error: "Something went wrong." });
    await expect(submitPriCorrection({ ...ok, fieldName: "secret" })).resolves.toEqual({ ok: false, error: "Something went wrong." });
    await expect(submitPriCorrection({ ...ok, suggestedContent: "   " })).resolves.toEqual({ ok: false, error: "Describe the correction first." });
    await expect(submitPriCorrection({ ...ok, sourceUrl: "example.com" })).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/http/) });
    await expect(submitPriCorrection({ ...ok, submitterEmail: "nope" })).resolves.toEqual({ ok: false, error: "That email address doesn't look right." });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("quietly drops honeypot submissions", async () => {
    await expect(submitPriCorrection({ ...ok, website: "x" })).resolves.toEqual({ ok: true });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("says it couldn't be sent when the email fails, so the form can offer the email link", async () => {
    vi.mocked(sendEmail).mockResolvedValueOnce(false);
    await expect(submitPriCorrection(ok)).resolves.toEqual({ ok: false, error: "This couldn't be sent just now. Please try again in a minute." });
  });
});

describe("submitFacilitatorIndex", () => {
  it("emails a quick intake with a referral request and flags it in the subject", async () => {
    await expect(
      submitFacilitatorIndex({
        kind: "quick",
        codedIdentity: "FX-12",
        archetype: "Guide",
        responses: "1,2,3",
        referralConsent: true,
        referralRegion: "Oregon",
        referralContact: "fx@example.com",
        locale: "en",
      }),
    ).resolves.toEqual({ ok: true });
    const [to, subject, html] = emailCall();
    expect(to).toBe("tony@tonygreenberg.com");
    expect(subject).toBe("Facilitator Index: introduction request from FX-12");
    for (const part of ["Quick Intake", "Guide", "Oregon", "fx@example.com", "1,2,3", "en"]) expect(html).toContain(part);
    expect(html).toContain("https://psychedelicreadiness.com/facilitator-index");
  });

  it("names a full anonymous submission", async () => {
    await submitFacilitatorIndex({ kind: "full", responses: "all 108" });
    const [, subject, html] = emailCall();
    expect(subject).toBe("Facilitator Index: full 108-item submission from anonymous");
    expect(html).toContain("Anonymous");
    expect(html).toContain(">No<");
  });

  it("refuses an unknown kind or empty responses", async () => {
    await expect(submitFacilitatorIndex({ kind: "other" as "full", responses: "x" })).resolves.toEqual({ ok: false, error: "Something went wrong." });
    await expect(submitFacilitatorIndex({ kind: "full", responses: "   " })).resolves.toEqual({ ok: false, error: "Paste your responses first." });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("says it couldn't be sent when the email fails", async () => {
    vi.mocked(sendEmail).mockResolvedValueOnce(false);
    await expect(submitFacilitatorIndex({ kind: "full", responses: "x" })).resolves.toMatchObject({ ok: false });
  });
});
