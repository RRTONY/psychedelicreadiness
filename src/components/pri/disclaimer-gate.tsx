"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { submitPriConsent } from "@/app/forms/actions";

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
            <div className="mb-2 font-mono text-[.65rem] tracking-[0.15em] text-brand-gold uppercase">A Note from Tony Greenberg</div>
            <p className="m-0 font-serif text-[.95rem] leading-[1.8] text-[#3D2E1E] italic">
              &ldquo;Here is what I want you to know before you go one click further. Most of these medicines I have never touched. Some of them I probably
              never will. What I have done is spent the better part of three decades watching this field from the inside... the researchers, the healers,
              the disasters, the quiet miracles that never made the news. This index is a synthesis of all of that. It exists because I have seen what
              happens when someone walks into a ceremony with no map and no container and no one who actually knows what they are doing. This is the map.
              Where you go from here is completely and entirely up to you.&rdquo;
            </p>
            <p className="mt-3 mb-0 font-mono text-[.7rem] tracking-[0.08em] text-brand-gold">— Tony Greenberg, Impact Futurist &amp; Investor in Consciousness Medicine</p>
          </div>

          <div className="mb-5 border-l-4 border-pri-purple bg-pri-purple/8 p-5">
            <div className="mb-2 text-[.82rem] font-extrabold tracking-[0.08em] text-pri-purple uppercase">Not a Doctor. Not a Dealer. Not Reddit.</div>
            <p className="m-0 leading-[1.7] text-pri-brown">
              The Psychedelic Readiness Index is built from decades of research, clinical literature, harm reduction work, and conversations with people
              who have actually been in the room. It is <strong>not medical advice</strong>, not a prescription, and not a substitute for a real
              conversation with a real healthcare professional who knows your history.
            </p>
          </div>

          <div className="mb-5 border-l-4 border-[#E65100] bg-[#FFF3E0] p-5">
            <div className="mb-2 text-[.82rem] font-extrabold tracking-[0.06em] text-[#E65100] uppercase">What This Is ... And What It Is Not</div>
            <ul className="my-2 list-disc space-y-1 pl-5 leading-[2]">
              <li>Not a doctor. Not a therapist. Not a shaman. We are none of those things and we are not pretending to be.</li>
              <li>Not anonymous internet advice. Every data point in here has been cross-referenced against clinical trials, harm reduction databases, and people who have actually sat with these medicines professionally.</li>
              <li>Not a recommendation. Nothing in here says you should do anything. It says here is what is known, here is what the research shows, here is what experienced practitioners report.</li>
              <li>A synthesis. Built from clinical literature, DanceSafe, Zendo Project, MAPS, ethnobotanical research, and the kind of conversations that happen when people stop performing and start being honest.</li>
              <li>A starting point. Not a finish line. Use this to have better conversations with qualified professionals, not to skip them.</li>
            </ul>
          </div>

          <div className="mb-5 bg-pri-cream p-5">
            <div className="mb-2 text-[.82rem] font-extrabold tracking-[0.06em] text-pri-ink uppercase">You Acknowledge &amp; Accept</div>
            <ol className="my-2 list-decimal space-y-1 pl-5 leading-[2]">
              <li>This is for education and harm reduction only. Full stop.</li>
              <li>Nothing listed here is an endorsement. Not a medicine, not a provider, not a protocol. We are not sending you anywhere.</li>
              <li>You will talk to a real healthcare professional before you do anything. That is not optional.</li>
              <li>You own your decisions. Every single one of them. We do not.</li>
              <li>The people who built this tool assume zero liability for what you do with it. Zero.</li>
              <li>Safety data evolves. What is true today may be updated tomorrow. Always verify with current clinical sources.</li>
              <li>A lot of what is covered here is illegal in a lot of places. You are responsible for knowing your laws. We are not your lawyer.</li>
            </ol>
          </div>

          <p className="mb-6 text-pri-tan italic">
            This tool exists because the alternative is people going in blind. And that is worse. But information without responsibility is just noise. You
            have to show up for your own safety.
          </p>
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
