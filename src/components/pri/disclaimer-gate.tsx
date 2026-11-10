"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { submitPriConsent } from "@/app/forms/actions";
import { ACKNOWLEDGE, CLOSING, NOT_A_DOCTOR, SCORE_CAN_TELL, TONY_NOTE, WHAT_THIS_IS } from "@/lib/content/pri-disclaimer";

// The disclaimer text lives in `src/lib/content/pri-disclaimer.ts` (shared with `/disclaimer`).
// Ported from legacy client/src/pages/pri/PsychedelicReadinessIndex.tsx's
// `DisclaimerGate` — the real full legal/harm-reduction disclaimer text and
// Tony's real personal note, unchanged and verbatim. Since 2026-10-10 the
// initials are saved to Supabase again (`submitPriConsent` in
// src/app/forms/actions.ts → pri_consents), like legacy's
// `trpc.pri.submitConsent`; consent is also kept in `sessionStorage` for the
// page's own gating. As on legacy ("Still allow access even if DB save
// fails"), a failed save never blocks the visitor.
export function DisclaimerGate({ onConsent }: { onConsent: () => void }) {
  const [initials, setInitials] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  const canProceed = initials.length >= 2 && agreed && !saving;

  const handleConsent = async () => {
    if (!canProceed) return;
    setSaving(true);
    await submitPriConsent({ initials }).catch(() => null);
    try {
      sessionStorage.setItem("pri-consent", "true");
    } catch {
      // private mode: the page's own state still lets them through
    }
    onConsent();
  };

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center overflow-y-auto bg-pri-ink/92 p-4 backdrop-blur-md">
      <div className="max-h-[92vh] w-full max-w-160 overflow-y-auto bg-pri-parchment px-8 py-10">
        <div className="mb-8 text-center">
          <AlertTriangle className="mx-auto mb-3 size-9 text-pri-purple" />
          <h2 className="mb-2 font-heading text-[clamp(1.5rem,4vw,2rem)] font-extrabold tracking-tight text-pri-ink">Before You Go In</h2>
          <div className="text-xs font-bold tracking-[0.1em] text-pri-purple uppercase">Read this. Actually read it.</div>
        </div>

        <div className="text-[.88rem] leading-[1.8] text-pri-brown">
          <div className="mb-6 rounded-sm border border-brand-gold/20 border-l-4 border-l-brand-gold bg-brand-gold/6 px-5 py-4">
            <div className="mb-2 font-mono text-[.65rem] tracking-[0.15em] text-brand-gold uppercase">{TONY_NOTE.title}</div>
            <p className="m-0 font-serif text-[.95rem] leading-[1.8] text-[#3D2E1E] italic">&ldquo;{TONY_NOTE.quote}&rdquo;</p>
            <p className="mt-3 mb-0 font-mono text-[.7rem] tracking-[0.08em] text-brand-gold">— {TONY_NOTE.byline}</p>
          </div>

          <div className="mb-5 border-l-4 border-pri-purple bg-pri-purple/8 p-5">
            <div className="mb-2 text-[.82rem] font-extrabold tracking-[0.08em] text-pri-purple uppercase">{NOT_A_DOCTOR.title}</div>
            <p className="m-0 leading-[1.7] text-pri-brown">
              {NOT_A_DOCTOR.before}
              <strong>{NOT_A_DOCTOR.strong}</strong>
              {NOT_A_DOCTOR.after}
            </p>
          </div>

          <div className="mb-5 border-l-4 border-pri-purple-light bg-pri-purple/5 p-5">
            <div className="mb-2 text-[.82rem] font-extrabold tracking-[0.08em] text-pri-purple uppercase">{SCORE_CAN_TELL.title}</div>
            {SCORE_CAN_TELL.paragraphs.map((p) => (
              <p key={p} className="mb-2 leading-[1.7] text-pri-brown last:mb-0">
                {p}
              </p>
            ))}
          </div>

          <div className="mb-5 border-l-4 border-[#E65100] bg-[#FFF3E0] p-5">
            <div className="mb-2 text-[.82rem] font-extrabold tracking-[0.06em] text-[#E65100] uppercase">{WHAT_THIS_IS.title}</div>
            <ul className="my-2 list-disc space-y-1 pl-5 leading-[2]">
              {WHAT_THIS_IS.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="mb-5 bg-pri-cream p-5">
            <div className="mb-2 text-[.82rem] font-extrabold tracking-[0.06em] text-pri-ink uppercase">{ACKNOWLEDGE.title}</div>
            <ol className="my-2 list-decimal space-y-1 pl-5 leading-[2]">
              {ACKNOWLEDGE.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>

          <p className="mb-6 text-pri-tan italic">{CLOSING}</p>
        </div>

        <div className="border-t-2 border-pri-border pt-6">
          <label className="mb-5 flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 size-5 accent-pri-purple" />
            <span className="text-[.88rem] leading-[1.6] text-pri-ink">
              Yes, I read it. I understand this is synthesized information, not medical advice. Whatever happens next is on me.
            </span>
          </label>

          <div className="mb-5">
            <label htmlFor="pri-disclaimer-initials" className="mb-2 block text-xs font-bold tracking-[0.08em] text-pri-tan uppercase">Type Your Initials to Confirm</label>
            <input
              id="pri-disclaimer-initials"
              type="text"
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 5))}
              placeholder="e.g. TG"
              maxLength={5}
              className={`w-full max-w-40 border-2 bg-pri-parchment px-4 py-3 text-center font-heading text-2xl font-bold tracking-[0.15em] text-pri-ink outline-none focus-visible:ring-2 focus-visible:ring-ring ${initials.length >= 2 ? "border-pri-purple" : "border-pri-border"}`}
            />
          </div>

          <button
            onClick={handleConsent}
            disabled={!canProceed}
            className={`inline-flex w-full items-center justify-center gap-2 px-8 py-4 text-center text-sm font-bold tracking-[0.05em] uppercase transition-colors ${canProceed || saving ? "bg-pri-purple text-pri-cream" : "bg-pri-border text-pri-tan"}`}
          >
            {saving && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
            I Understand — Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
