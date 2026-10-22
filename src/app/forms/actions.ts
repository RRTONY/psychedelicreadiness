"use server";

import { esc, sendEmail } from "@/lib/email";

// The site's forms, ported from tonygreenberg.com. That site saves each one to
// Supabase and emails Tony; this one has no database (owner's choice,
// 2026-10-23), so the email IS the record. Every field is validated and
// clipped here, whatever the browser sent. If the email can't be sent the
// form shows the error with an "email Tony directly" link, so nothing is lost.
// The PRI consent is checked but not stored (on tonygreenberg.com it's an
// audit-log row with no email).

const OWNER_EMAIL = "tony@tonygreenberg.com";
const SITE = "https://psychedelicreadiness.com";
const UNAVAILABLE = "This couldn't be sent just now. Please try again in a minute.";
const BAD_EMAIL = "That email address doesn't look right.";

export type FormResult = { ok: boolean; error?: string };

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s);

// A plain two-column summary for Tony's email. Empty answers are left out.
function emailHtml(intro: string, rows: [string, string | null | undefined][], link?: string): string {
  const body = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#666;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${esc(v as string)}</td></tr>`,
    )
    .join("");
  return `<p>${esc(intro)}</p><table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${body}</table>${
    link ? `<p><a href="${SITE}${link}">${SITE}${link}</a></p>` : ""
  }`;
}

// ── PRI consent ("Before You Go In") ──
export async function submitPriConsent(input: { initials: string }): Promise<FormResult> {
  const initials = clip(input.initials, 10).toUpperCase();
  if (initials.length < 2) return { ok: false, error: "Type your initials to confirm." };
  return { ok: true };
}

// ── PRI "Suggest a Correction" ──
const PRI_FIELDS = [
  "overview",
  "therapeutic",
  "tradition",
  "contraindications",
  "sideEffects",
  "drugInteractions",
  "safetyWarning",
  "legalStatus",
  "pricing",
  "providers",
];

export async function submitPriCorrection(input: {
  medicineId: string;
  medicineName: string;
  fieldName: string;
  fieldLabel: string;
  currentContent?: string;
  suggestedContent: string;
  sourceUrl?: string;
  submitterName?: string;
  submitterEmail?: string;
  website?: string; // honeypot
}): Promise<FormResult> {
  if (input.website) return { ok: true };
  const medicineId = clip(input.medicineId, 64);
  const fieldName = clip(input.fieldName, 64);
  const suggested = clip(input.suggestedContent, 5000);
  const sourceUrl = clip(input.sourceUrl, 512);
  const name = clip(input.submitterName, 256);
  const email = clip(input.submitterEmail, 320);
  if (!/^[a-z0-9-]{1,64}$/.test(medicineId) || !PRI_FIELDS.includes(fieldName)) return { ok: false, error: "Something went wrong." };
  if (!suggested) return { ok: false, error: "Describe the correction first." };
  if (sourceUrl && !isUrl(sourceUrl)) return { ok: false, error: "The source should be a web address starting with http." };
  if (email && !isEmail(email)) return { ok: false, error: BAD_EMAIL };

  const medicine = clip(input.medicineName, 128) || medicineId;
  const section = clip(input.fieldLabel, 64) || fieldName;
  const sent = await sendEmail(
    OWNER_EMAIL,
    `PRI correction: ${medicine} (${section})`,
    emailHtml(
      "Someone suggested a correction on the Psychedelic Readiness Index (psychedelicreadiness.com).",
      [
        ["Medicine", medicine],
        ["Section", section],
        ["Current", clip(input.currentContent, 5000)],
        ["Suggested", suggested],
        ["Source", sourceUrl],
        ["From", name || "Anonymous"],
        ["Email", email],
      ],
      "/",
    ),
  );
  return sent ? { ok: true } : { ok: false, error: UNAVAILABLE };
}

// ── /facilitator-index: full 108-item paste-in and the Quick Intake ──
export async function submitFacilitatorIndex(input: {
  kind: "full" | "quick";
  codedIdentity?: string;
  archetype?: string;
  responses: string;
  referralConsent?: boolean;
  referralRegion?: string;
  referralContact?: string;
  locale?: string;
}): Promise<FormResult> {
  if (input.kind !== "full" && input.kind !== "quick") return { ok: false, error: "Something went wrong." };
  const responses = clip(input.responses, 50000);
  if (!responses) return { ok: false, error: "Paste your responses first." };
  const code = clip(input.codedIdentity, 128);
  const archetype = clip(input.archetype, 128);
  const region = clip(input.referralRegion, 256);
  const contact = clip(input.referralContact, 512);
  const referral = input.referralConsent === true;
  const what = input.kind === "quick" ? "Quick Intake" : "full 108-item submission";
  const locale = clip(input.locale, 64);
  const sent = await sendEmail(
    OWNER_EMAIL,
    `Facilitator Index: ${referral ? "introduction request" : what} from ${code || "anonymous"}`,
    emailHtml(
      `A new Facilitator Index ${what} came in.`,
      [
        ["Code", code || "Anonymous"],
        ["Archetype", archetype],
        ["Wants an introduction", referral ? "Yes" : "No"],
        ["Region", region],
        ["Contact", contact],
        ["Locale", locale],
        ["Responses", responses.slice(0, 20000)],
      ],
      "/facilitator-index",
    ),
  );
  return sent ? { ok: true } : { ok: false, error: UNAVAILABLE };
}
