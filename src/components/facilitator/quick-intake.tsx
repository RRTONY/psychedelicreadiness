"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDot, Gem, Hexagon, Loader2 } from "lucide-react";
import { QUICK_QUESTIONS, SCALE_LABELS, deriveArchetype } from "@/lib/content/facilitator-index-data";
import { submitFacilitatorIndex } from "@/app/forms/actions";
import { FormError, mailtoHref } from "@/components/forms/form-error";

const CONTACT_EMAIL = "tony@tonygreenberg.com";

function RadarBars({ bands }: { bands: { label: string; score: number; color: string }[] }) {
  return (
    <div className="my-6 flex flex-col gap-2.5">
      {bands.map((b) => (
        <div key={b.label}>
          <div className="mb-1 flex justify-between">
            <span className="text-xs font-bold tracking-[0.08em] text-facilitator-ink/55 uppercase">{b.label}</span>
            <span className="text-xs font-bold" style={{ color: b.color }}>
              {b.score}/10
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-facilitator-ink/8">
            <div className="h-full rounded-full transition-[width] duration-800" style={{ width: `${b.score * 10}%`, backgroundColor: b.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const WHATS_WAITING = [
  { icon: Gem, label: "12 Bands", desc: "Context · Philosophy · Temperament · The Map · Container · Consent · Safety · Edges · Lineage · Business · Reciprocity · Integration" },
  { icon: Hexagon, label: "108 Items", desc: "Every question the field has been afraid to ask out loud. Scored, mapped, and returned to you as a living document." },
  { icon: CircleDot, label: "Your Archetype Profile", desc: "A full practitioner profile — not a personality type, a philosophical position. Where you actually stand." },
];

function WhatWaitsTeaser({ onGoDeeper }: { onGoDeeper: () => void }) {
  return (
    <div className="mt-6">
      <div className="mb-4 text-xs font-bold tracking-[0.14em] text-facilitator-amber-deep uppercase">What&apos;s waiting on the other side</div>
      <div className="mb-6 flex flex-col gap-3">
        {WHATS_WAITING.map((it) => (
          <div key={it.label} className="flex items-start gap-3.5">
            <it.icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-facilitator-amber-light" />
            <div>
              <div className="mb-0.5 text-sm font-bold text-facilitator-ink">{it.label}</div>
              <div className="text-[.78rem] leading-normal text-facilitator-ink/55">{it.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onGoDeeper} className="w-full rounded-[10px] bg-linear-to-br from-facilitator-amber via-facilitator-amber-deep to-facilitator-amber-light px-8 py-4 text-sm font-bold tracking-[0.06em] text-[#FFFBF2] uppercase shadow-[0_4px_20px_rgba(180,83,9,.25)]">
        <span className="inline-flex items-center gap-1.5">
          Enter the Full Index <ArrowRight aria-hidden="true" className="size-4" />
        </span>
      </button>
    </div>
  );
}

type Step = "intro" | "quiz" | "revealing" | "reveal" | "form" | "done";

// Ported from legacy's `QuickIntake` — the real 15-question archetype
// quiz and the real archetype-derivation engine (`deriveArchetype`, in
// `lib/content/facilitator-index-data.ts`), unchanged and fully
// client-computed, no backend needed. Legacy's "seeded, realistic-feeling"
// `PeerStats` component (its own comment admits the numbers — "163
// practitioners mapped so far" etc. — are fabricated, not real) is dropped
// entirely rather than ported as fake community stats, same principle
// applied to BrewSoul's stale "reads" counts elsewhere in this migration.
// The final "Log My Responses" step posts to `trpc.facilitatorIndex.
// submit` on legacy; since 2026-10-10 it saves to Supabase again
// (`submitFacilitatorIndex` in src/app/forms/actions.ts →
// facilitator_submissions, kind 'quick') and emails Tony. If saving fails,
// the error offers a pre-filled email to Tony instead. Two optional fields,
// so plain state rather than Formik.
export function QuickIntake({ onGoDeeper }: { onGoDeeper: () => void }) {
  const [step, setStep] = useState<Step>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState("");

  const q = QUICK_QUESTIONS[current];
  const val = answers[q?.id] ?? 5;
  const progress = Math.round(((current + 1) / QUICK_QUESTIONS.length) * 100);
  const archetype = deriveArchetype(answers);

  const currentBand = q?.band ?? "";
  const uniqueBands = Array.from(new Set(QUICK_QUESTIONS.map((qq) => qq.band)));
  const bandIndex = uniqueBands.indexOf(currentBand);

  function handleSlider(v: number) {
    setAnswers((prev) => ({ ...prev, [q.id]: v }));
  }

  function handleNext() {
    if (current < QUICK_QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setStep("revealing");
      setTimeout(() => setStep("reveal"), 1200);
    }
  }

  function handleBack() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    const lines = QUICK_QUESTIONS.map((qq) => `${qq.band} — ${qq.q}: ${answers[qq.id] ?? 5}/10`).join("\n");
    setSaving(true);
    setError(null);
    const res = await submitFacilitatorIndex({
      kind: "quick",
      codedIdentity: name,
      archetype: archetype.title,
      responses: `QUICK INTAKE\n\n${lines}`,
      referralConsent: !!contact.trim(),
      referralContact: contact,
      locale: typeof navigator !== "undefined" ? navigator.language : undefined,
    }).catch(() => ({ ok: false, error: "This couldn't be saved just now." }));
    setSaving(false);
    if (res.ok) {
      setSubmitted(true);
      setStep("done");
      return;
    }
    setError(res.error ?? "Something went wrong.");
    setFallback(
      mailtoHref(CONTACT_EMAIL, "Facilitator Index — Quick Intake", [
        `Archetype: ${archetype.title}`,
        name.trim() && `Code: ${name.trim()}`,
        contact.trim() && `Contact for introduction: ${contact.trim()}`,
        "",
        "QUICK INTAKE",
        "",
        lines,
      ]),
    );
  }

  if (step === "intro") {
    return (
      <div className="p-8 text-center">
        <Gem aria-hidden="true" className="mx-auto mb-3 size-10 text-facilitator-amber-deep drop-shadow-[0_2px_8px_rgba(180,83,9,.3)]" />
        <h2 className="mb-2.5 font-heading text-[clamp(1.4rem,3vw,2rem)] font-bold text-facilitator-ink">Know Who You Go With</h2>
        <p className="mx-auto mb-4 max-w-120 text-[.95rem] leading-[1.65] text-facilitator-ink/60">
          Most people in this field have never been asked what they actually believe — only what they&apos;ve done. This is the other question. 15 items.
          Your <strong className="text-facilitator-amber-deep">Practitioner Archetype</strong> at the end. No account, no record.
        </p>
        <div className="mt-2 flex flex-col items-center gap-4">
          <button onClick={() => setStep("quiz")} className="w-full max-w-85 rounded-[10px] bg-linear-to-br from-facilitator-amber via-facilitator-amber-deep to-facilitator-amber-light px-10 py-4 text-sm font-bold tracking-[0.06em] text-[#FFFBF2] uppercase shadow-[0_4px_20px_rgba(180,83,9,.2)]">
            <span className="inline-flex items-center gap-1.5">
              Discover My Archetype <ArrowRight aria-hidden="true" className="size-4" />
            </span>
          </button>
          <button onClick={onGoDeeper} className="w-full max-w-85 rounded-lg border border-facilitator-amber-light/35 px-8 py-3 text-[.88rem] text-facilitator-amber-deep">
            Skip to Full 108-Item Index
          </button>
        </div>
      </div>
    );
  }

  if (step === "revealing") {
    return (
      <div className="p-12 text-center">
        <Loader2 className="mx-auto mb-4 size-10 animate-spin text-facilitator-amber-deep" />
        <p className="text-[.95rem] text-facilitator-ink/55">Mapping your position in the field…</p>
      </div>
    );
  }

  if (step === "reveal") {
    return (
      <div className="py-4">
        <div className="mb-6 text-center">
          <div className="mb-2 flex justify-center" style={{ color: archetype.color }}>
            <archetype.icon aria-hidden="true" className="size-12" />
          </div>
          <div className="mb-1 text-xs font-bold tracking-[0.18em] uppercase" style={{ color: archetype.color }}>
            Your Practitioner Archetype
          </div>
          <h2 className="mb-1 font-heading text-[clamp(1.5rem,4vw,2.2rem)] font-bold text-facilitator-ink">{archetype.title}</h2>
          <div className="text-[.8rem] tracking-[0.06em] text-facilitator-ink/50">{archetype.subtitle}</div>
        </div>

        <div className="mb-5 rounded-[10px] border p-6" style={{ borderColor: `${archetype.color}30`, borderLeftColor: archetype.color, borderLeftWidth: 3 }}>
          <p className="m-0 text-[.92rem] leading-[1.72] text-[#2D1F0A]">{archetype.description}</p>
        </div>

        <div className="mb-2 text-xs font-bold tracking-[0.12em] text-facilitator-ink/40 uppercase">Your Profile Across Six Dimensions</div>
        <RadarBars bands={archetype.bands} />

        <WhatWaitsTeaser onGoDeeper={onGoDeeper} />

        <div className="mt-5 border-t border-facilitator-ink/8 pt-5 text-center">
          <button onClick={() => setStep("form")} className="rounded-lg border border-facilitator-amber-light/30 px-7 py-2.5 text-[.85rem] text-facilitator-amber-deep/70">
            Log My Responses in the Index
          </button>
        </div>
      </div>
    );
  }

  if (step === "done" && submitted) {
    return (
      <div className="p-10 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-9 text-[#059669]" />
        <h3 className="mb-2 font-heading text-xl text-facilitator-ink">You&apos;re in the record.</h3>
        <p className="mx-auto mb-4 max-w-105 text-[.9rem] leading-[1.6] text-facilitator-ink/60">
          Your archetype — <strong className="text-facilitator-amber-deep">{archetype.title}</strong> — is now part of the index. When you&apos;re ready to
          go deeper, the full 108-item instrument is waiting.
        </p>
        <button onClick={onGoDeeper} className="mt-2 rounded-[10px] bg-linear-to-br from-facilitator-amber via-facilitator-amber-deep to-facilitator-amber-light px-10 py-3.5 text-sm font-bold tracking-[0.06em] text-[#FFFBF2] uppercase shadow-[0_4px_20px_rgba(180,83,9,.2)]">
          <span className="inline-flex items-center gap-1.5">
            Enter the Full Index <ArrowRight aria-hidden="true" className="size-4" />
          </span>
        </button>
      </div>
    );
  }

  if (step === "form") {
    return (
      <form onSubmit={handleSubmit} className="py-4">
        <div className="mb-5 text-center">
          <span className="inline-flex" style={{ color: archetype.color }}>
            <archetype.icon aria-hidden="true" className="size-6" />
          </span>
          <h3 className="mt-1.5 mb-1 font-heading text-lg text-facilitator-ink">Log {archetype.title}</h3>
          <p className="text-[.82rem] text-facilitator-ink/50">Your responses join the index anonymously. Optional: leave a code or contact.</p>
        </div>
        <label htmlFor="quick-intake-name" className="mb-1.5 block text-xs font-bold tracking-[0.08em] text-facilitator-ink/45 uppercase">Name or Code (optional)</label>
        <input
          id="quick-intake-name"
          type="text"
          placeholder="e.g. CEDAR-001 or leave blank"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4.5 w-full rounded-md border border-facilitator-amber-light/30 bg-white/85 px-3.5 py-2.5 text-[.9rem] text-facilitator-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <label htmlFor="quick-intake-contact" className="mb-1.5 block text-xs font-bold tracking-[0.08em] text-facilitator-ink/45 uppercase">Contact for introduction (optional)</label>
        <input
          id="quick-intake-contact"
          type="text"
          placeholder="Email or Signal — for Tony only, never published"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="mb-6 w-full rounded-md border border-facilitator-amber-light/30 bg-white/85 px-3.5 py-2.5 text-[.9rem] text-facilitator-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {error && <FormError error={error} mailto={fallback} className="mb-4 text-[.88rem] text-facilitator-ink" />}
        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-linear-to-br from-facilitator-amber-deep to-facilitator-amber-light px-8 py-3.5 text-sm font-bold tracking-[0.06em] text-facilitator-ink uppercase disabled:opacity-70"
          >
            {saving && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
            Submit &amp; Log
          </button>
          <button type="button" onClick={() => setStep("reveal")} className="rounded-lg border border-facilitator-amber-light/35 px-7 py-3.5 text-[.88rem] text-facilitator-amber-deep">
            Back to My Profile
          </button>
        </div>
      </form>
    );
  }

  const [lo, hi] = SCALE_LABELS[q.id] || ["Low", "High"];
  return (
    <div className="py-4">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-facilitator-ink/8">
            <div className="h-full rounded-full bg-linear-to-r from-facilitator-amber via-facilitator-amber-deep to-facilitator-amber-light transition-[width] duration-400" style={{ width: `${progress}%` }} />
          </div>
          <span className="shrink-0 text-[clamp(.82rem,2vw,.9rem)] font-bold tracking-[0.06em] text-facilitator-amber">
            {current + 1} / {QUICK_QUESTIONS.length}
          </span>
        </div>
        <div className="flex justify-between gap-1">
          {uniqueBands.map((band, i) => {
            const isActive = band === currentBand;
            const isPast = i < bandIndex;
            return <div key={band} title={band} className={`h-0.75 flex-1 rounded ${isPast ? "bg-facilitator-amber-deep" : isActive ? "bg-facilitator-amber-light" : "bg-facilitator-ink/10"}`} />;
          })}
        </div>
        <div className="mt-1 text-right text-[.62rem] text-facilitator-ink/35">{progress < 100 ? `${100 - progress}% remaining` : "Almost there"}</div>
      </div>

      <span className="mb-3 block text-[clamp(.78rem,2vw,.88rem)] font-bold tracking-[0.16em] text-facilitator-amber uppercase">{q.band}</span>

      <p className="mb-8 min-h-14 font-heading text-[clamp(1.2rem,3.5vw,1.5rem)] leading-[1.55] text-facilitator-ink">{q.q}</p>

      <div className="mb-5">
        <input type="range" min={1} max={10} value={val} onChange={(e) => handleSlider(Number(e.target.value))} className="h-1 w-full accent-facilitator-amber-deep" />
        <div className="mt-2 flex justify-between">
          <span className="max-w-[42%] text-[clamp(.82rem,2vw,.9rem)] leading-[1.3] font-medium text-facilitator-ink/65">{lo}</span>
          <div className="text-center">
            <div className="font-heading text-[clamp(2rem,5vw,2.4rem)] leading-none font-bold text-facilitator-amber">{val}</div>
            <div className="text-[clamp(.7rem,1.8vw,.78rem)] text-facilitator-ink/45">/ 10</div>
          </div>
          <span className="max-w-[42%] text-right text-[clamp(.82rem,2vw,.9rem)] leading-[1.3] font-medium text-facilitator-ink/65">{hi}</span>
        </div>
      </div>

      {current === 7 && (
        <div className="mb-4 rounded-lg border border-facilitator-amber-light/20 bg-facilitator-amber-light/8 px-4 py-3 text-[.8rem] leading-normal text-facilitator-ink/55">
          Halfway there. Your archetype is starting to take shape.
        </div>
      )}
      {current === 13 && (
        <div className="mb-4 rounded-lg border border-[#059669]/20 bg-[#059669]/8 px-4 py-3 text-[.8rem] leading-normal text-facilitator-ink/55">
          One more. Then you&apos;ll see exactly where you stand.
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button onClick={handleBack} disabled={current === 0} className={`rounded-[10px] border-[1.5px] border-facilitator-amber-light/35 px-7 py-3.5 text-[clamp(1rem,2.5vw,1.05rem)] font-semibold text-facilitator-amber-deep/85 ${current === 0 ? "opacity-30" : ""}`}>
          <span className="inline-flex items-center gap-1.5">
            <ArrowLeft aria-hidden="true" className="size-4" /> Back
          </span>
        </button>
        <button onClick={handleNext} className="rounded-[10px] bg-linear-to-br from-facilitator-amber-deep to-facilitator-amber-light px-9 py-3.5 text-[clamp(1rem,2.5vw,1.1rem)] font-extrabold tracking-[0.03em] text-facilitator-ink shadow-[0_4px_16px_rgba(180,83,9,.3)]">
          <span className="inline-flex items-center gap-1.5">
            {current === QUICK_QUESTIONS.length - 1 ? "Reveal My Archetype" : "Next"}
            <ArrowRight aria-hidden="true" className="size-4" />
          </span>
        </button>
      </div>
    </div>
  );
}
