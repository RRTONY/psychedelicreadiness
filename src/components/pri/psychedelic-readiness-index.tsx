"use client";

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Heart, X, AlertTriangle, Ban, Star, FileText, CheckCircle2, Target, ArrowLeft, ArrowRight } from "lucide-react";
import {
  MEDICINES,
  QUESTIONS,
  DIM_LABELS,
  DIM_ICONS,
  SLIDER_LABELS,
  MAOB_INTERACTIONS,
  MAOB_WASHOUT,
  MEDICATION_INTERACTIONS,
  CRISIS_RESOURCES,
  PATHWAY_QUESTIONS,
  type Medicine,
  type MedicineWithSafety,
  type DimKey,
} from "@/lib/content/pri-data";
import { MEDICINE_IMAGES } from "@/lib/content/pri-medicine-images";
import { getMedicineWithSafety, computeScores, TAG_CLASS, DEFAULT_TAG_CLASS } from "@/lib/content/pri-shared";
import { DisclaimerGate } from "@/components/pri/disclaimer-gate";
// Opens only when a medicine is tapped; loading it then keeps it (and its correction form) out of
// the page's first load (Lighthouse, 2026-10-08).
const MedicineModal = dynamic(() => import("@/components/pri/medicine-modal").then((m) => m.MedicineModal), { ssr: false });
import { PriShareBar } from "@/components/pri/share-bar";
import { CinematicBand } from "@/components/pri/cinematic-band";
import { PriReport } from "@/components/pri/pri-report";

const CONTACT_EMAIL = "tony@tonygreenberg.com";

function DimIcon({ dim, className }: { dim: DimKey; className: string }) {
  const Icon = DIM_ICONS[dim];
  return <Icon aria-hidden="true" className={className} />;
}

// ── Consent store (sessionStorage-backed boolean) ──
// Hydration-safe read via useSyncExternalStore, same idiom established in
// `collection-explorer.tsx` — legacy's `useState(() => sessionStorage...)`
// initializer would crash during SSR (sessionStorage doesn't exist on the
// server) and is a real hydration-mismatch source besides.
const consentListeners = new Set<() => void>();
function readConsent(): boolean {
  try {
    return sessionStorage.getItem("pri-consent") === "true";
  } catch {
    return false;
  }
}
function writeConsent() {
  try {
    sessionStorage.setItem("pri-consent", "true");
  } catch {
    // ignore
  }
  consentListeners.forEach((l) => l());
}
function subscribeConsent(listener: () => void) {
  consentListeners.add(listener);
  return () => consentListeners.delete(listener);
}
function getConsentServerSnapshot() {
  return false;
}

// ── Saved-medicines store (localStorage-backed string[]) ──
const SAVED_KEY = "pri-saved-medicines";
const EMPTY_SAVED: readonly string[] = [];
const savedListeners = new Set<() => void>();
let cachedRawSaved: string | null | undefined;
let cachedSavedIds: string[] = [];
function readSaved(): string[] {
  const raw = localStorage.getItem(SAVED_KEY);
  if (raw === cachedRawSaved) return cachedSavedIds;
  cachedRawSaved = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedSavedIds = Array.isArray(parsed) ? parsed : [];
  } catch {
    cachedSavedIds = [];
  }
  return cachedSavedIds;
}
function writeSaved(next: string[]) {
  cachedRawSaved = JSON.stringify(next);
  cachedSavedIds = next;
  localStorage.setItem(SAVED_KEY, cachedRawSaved);
  savedListeners.forEach((l) => l());
}
function subscribeSaved(listener: () => void) {
  savedListeners.add(listener);
  return () => savedListeners.delete(listener);
}
function getSavedServerSnapshot(): string[] {
  return EMPTY_SAVED as string[];
}

type AppState = "philosophy" | "intro" | "quiz" | "pathway" | "results";


const PHILOSOPHY_PARAGRAPHS = [
  { text: "The diode of perception tethering movement to bone accelerates the other fundamental processes of life.", italic: false },
  {
    text: "Beyond hunger, what you think of as necessity or craving is automatically fulfilled in the quickening of the senses — as spirit reaches in to taste the body.",
    italic: true,
  },
  { text: "Things of the past and future, things that you touch for pleasure — the pleasure is what electrical current you offer that thing.", italic: false },
  {
    text: "If it is a living body — animal or human — it knows your love as you embrace its presence with your energetic breath: the waves of awareness stemming from that which you control your body from spirit.",
    italic: true,
  },
  {
    text: "The sharpening of will takes place as the simplicity of life — the places where your awareness cannot escape the body to forget itself in idle pastures, but remains alive in the sensation of time slowing across the curve of heartbeat weaving breath.",
    italic: false,
  },
];

// Ported from legacy client/src/pages/pri/PsychedelicReadinessIndex.tsx —
// the real 39-medicine pharmacopoeia, real 50+ question / 6-domain
// assessment, real MAO-B interaction matrix, real medication interaction
// guide and real compare/save/PDF-export tooling, all unchanged and
// verbatim. Legacy's 6 initials-only testimonials were removed 2026-10-13
// (owner: possibly invented, see docs/ai/project_production_restoration_branch.md). Kept as a single client island since one state
// machine (`state`) drives which section renders — same call already made
// for other large multi-step assessments this migration.
//
// Real simplifications from legacy, each an honest-degradation call
// consistent with the rest of this migration:
// - `trpc.pri.submitConsent` / `trpc.pri.submitCorrection` /
//   `trpc.assessments.submit` (three backend mutations never built) were all
//   dropped at first. Since 2026-10-10 consent and corrections save to Supabase
//   again (`disclaimer-gate.tsx` and `correction-form.tsx`, through
//   src/app/forms/actions.ts); consent is still kept in `sessionStorage`
//   for the page's gating too. The referral form still uses a real
//   `mailto:` fallback (this file's referral card) rather than
//   reproducing a submit call with nothing behind it — legacy's correction
//   form's error path was a real fake-success bug ("still show success for
//   UX" even when the mutation threw), not reproduced here.
// - The inert "Add my results to the research pool" checkbox (no handler,
//   no effect, in legacy too) is dropped rather than shipped as a checkbox
//   that does nothing.
// - The legacy `<style>` block's shimmer/glow/scanline `@keyframes` and the
//   `glitch-scanlines`/`glitch-tear` decorative overlay divs are dropped —
//   same "decoration not worth the cost" call made throughout this
//   migration (the real hero photography underneath is kept, via
//   `cinematic-band.tsx`).
// - Legacy's duplicate "download results" affordance (a custom `exportPDF`
//   button immediately followed by a second, differently-behaved
//   `<AssessmentResultActions>` component) is collapsed to just the real,
//   fully-featured custom PDF export — it already covers dimension scores,
//   top matches, the healing sequence, and saved medicines; the second
//   button offered a plainer print with none of that.
// - Framer-motion's staggered grid-entrance animation on the medicine grid
//   is dropped (`no framer-motion` — CONTRIBUTING.md rule 5); the grid
//   renders directly.
// - Real stale-count bug found and fixed: the `MEDICINES` dataset has grown
//   to 39 entries, but every hardcoded "26" in legacy's copy (hero subhead,
//   grid heading, stats bar, alt text) was never updated to match — same
//   class of bug as BrewSoul's stale "103 Coffees" label fixed earlier in
//   this migration. Replaced with `MEDICINES.length` everywhere so it can't
//   drift again.
export function PsychedelicReadinessIndex() {
  const [state, setState] = useState<AppState>("philosophy");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => new Array(QUESTIONS.length).fill(5));
  const [pathwayAnswers, setPathwayAnswers] = useState<Record<string, number>>(() => Object.fromEntries(PATHWAY_QUESTIONS.map((q) => [q.id, 5])));
  const [currentPathwayQ, setCurrentPathwayQ] = useState(0);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineWithSafety | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [referralConsent, setReferralConsent] = useState(false);
  const [referralName, setReferralName] = useState("");
  const [referralEmail, setReferralEmail] = useState("");
  const [referralRegion, setReferralRegion] = useState("");
  const [referralSent, setReferralSent] = useState(false);

  const hasConsent = useSyncExternalStore(subscribeConsent, readConsent, getConsentServerSnapshot);
  const savedMeds = useSyncExternalStore(subscribeSaved, readSaved, getSavedServerSnapshot);

  const toggleSaved = useCallback((id: string) => {
    const current = readSaved();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    writeSaved(next);
  }, []);

  const assessmentRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (state !== "results") return null;
    return computeScores(answers);
  }, [state, answers]);

  // "Save My Results": renders <PriReport> (hidden on screen) with today's date, then opens the
  // browser's print dialog, which also offers "Save as PDF". flushSync makes sure the date is in
  // the page before the dialog snapshots it.
  const [reportDate, setReportDate] = useState("");
  const exportPDF = useCallback(() => {
    if (!results) return;
    flushSync(() => setReportDate(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })));
    const title = document.title;
    document.title = "Psychedelic Readiness Index - Personal Report";
    window.print();
    document.title = title;
  }, [results]);

  const handleSliderChange = useCallback(
    (value: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentQ] = value;
        return next;
      });
    },
    [currentQ]
  );

  const nextQuestion = useCallback(() => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      setState("pathway");
      setCurrentPathwayQ(0);
      setTimeout(() => assessmentRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [currentQ]);

  const nextPathwayQuestion = useCallback(() => {
    if (currentPathwayQ < PATHWAY_QUESTIONS.length - 1) {
      setCurrentPathwayQ((q) => q + 1);
    } else if (!hasConsent) {
      setShowDisclaimer(true);
    } else {
      setState("results");
      setTimeout(() => assessmentRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [currentPathwayQ, hasConsent]);

  const prevPathwayQuestion = useCallback(() => {
    if (currentPathwayQ > 0) {
      setCurrentPathwayQ((q) => q - 1);
    } else {
      setState("quiz");
      setCurrentQ(QUESTIONS.length - 1);
    }
  }, [currentPathwayQ]);

  const handleConsentComplete = useCallback(() => {
    writeConsent();
    setShowDisclaimer(false);
    setState("results");
    setTimeout(() => assessmentRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  const prevQuestion = useCallback(() => {
    if (currentQ > 0) setCurrentQ((q) => q - 1);
  }, [currentQ]);

  const startQuiz = useCallback(() => {
    setState("quiz");
    setTimeout(() => assessmentRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  const resetQuiz = useCallback(() => {
    setCurrentQ(0);
    setAnswers(new Array(QUESTIONS.length).fill(5));
    setCurrentPathwayQ(0);
    setPathwayAnswers(Object.fromEntries(PATHWAY_QUESTIONS.map((q) => [q.id, 5])));
    setState("intro");
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  const sliderLabel = useMemo(() => {
    const v = answers[currentQ];
    const idx = Math.round(((v - 1) / 9) * 4);
    return SLIDER_LABELS[idx];
  }, [answers, currentQ]);

  const handleMedicineClick = useCallback(
    (m: Medicine) => {
      const mws = getMedicineWithSafety(m);
      if (!hasConsent) {
        setShowDisclaimer(true);
        sessionStorage.setItem("pri-pending-medicine", m.id);
      } else {
        setSelectedMedicine(mws);
      }
    },
    [hasConsent]
  );

  // Both of the checks below react to an external event (consent being
  // granted; a one-time `?m=` deep link) rather than to a prop/state change
  // that should reset something — the "adjust state during render instead
  // of useEffect+setState" pattern CONTRIBUTING.md's own example table
  // prescribes for exactly this shape, and the one already used for
  // `nav-mobile-menu`'s pathname reset. `react-hooks/set-state-in-effect`
  // would otherwise flag a `useEffect`+`setState` version of either.
  const [prevHasConsent, setPrevHasConsent] = useState(hasConsent);
  if (hasConsent !== prevHasConsent) {
    setPrevHasConsent(hasConsent);
    if (hasConsent) {
      const pendingId = sessionStorage.getItem("pri-pending-medicine");
      if (pendingId) {
        sessionStorage.removeItem("pri-pending-medicine");
        const m = MEDICINES.find((med) => med.id === pendingId);
        if (m) setSelectedMedicine(getMedicineWithSafety(m));
      }
    }
  }

  const [consumedDeepLink, setConsumedDeepLink] = useState(false);
  if (!consumedDeepLink && typeof window !== "undefined") {
    setConsumedDeepLink(true);
    const mId = new URLSearchParams(window.location.search).get("m");
    if (mId) {
      const m = MEDICINES.find((med) => med.id === mId);
      if (m) {
        if (hasConsent) {
          setSelectedMedicine(getMedicineWithSafety(m));
        } else {
          sessionStorage.setItem("pri-pending-medicine", m.id);
          setShowDisclaimer(true);
        }
      }
    }
  }

  const handleReferralSubmit = useCallback(() => {
    if (!referralEmail || !referralRegion) return;
    const subject = encodeURIComponent("PRI Facility Introduction Request");
    const bodyLines = [
      `Name: ${referralName || "(not provided)"}`,
      `Email: ${referralEmail}`,
      `Region: ${referralRegion}`,
      "",
      results ? `PRI score: ${results.overall} (${results.level.label})` : "",
      results ? `Top matches: ${results.topMatches.map((m) => m.name).join(", ")}` : "",
    ].filter(Boolean);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    setReferralSent(true);
  }, [referralEmail, referralRegion, referralName, results]);

  const domain = QUESTIONS[currentQ];
  const pathwayQ = PATHWAY_QUESTIONS[currentPathwayQ];

  return (
    <>
    <div ref={topRef} className="bg-pri-cream font-body text-pri-ink leading-[1.7] print:hidden">
      {/* ── HERO ── */}
      {/* Full-width background, text kept to the 900px column (owner, 2026-10-23). The site header is
          sticky and takes its own 4rem, so the hero fills the rest of the screen. */}
      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-center overflow-hidden px-5 pt-16 pb-16">
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
          <Image
            src="https://cdn.sanity.io/images/a3q1cyqs/production/1126cd46fd317e79cb543645ef44a536ae95f417-1920x1072.webp"
            alt=""
            fill
            sizes="100vw"
            fetchPriority="high"
            loading="eager"
            className="object-cover object-[center_35%] brightness-85 contrast-110 saturate-120"
          />
          <div className="absolute inset-0 bg-linear-to-br from-pri-cream/85 via-pri-cream/50 to-pri-cream/20" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-225">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-pri-purple uppercase">
            <span className="block h-0.5 w-6 bg-pri-purple" />
            Psychedelic Readiness Index
          </div>
          <h1 className="mb-6 font-heading text-[clamp(2.5rem,8vw,6rem)] leading-[1] font-black tracking-[-0.03em] text-pri-ink">
            Find My
            <br />
            <em className="text-pri-purple not-italic">Medicine</em>
          </h1>
          <p className="mb-4 max-w-140 text-[clamp(.95rem,2.5vw,1.1rem)] text-pri-brown">
            {MEDICINES.length} plant medicines. 50+ readiness questions. 6 domains. MAO-B interaction matrix. An honest map of where you stand ... before
            you walk into territory that rewards preparation.
          </p>

          <div className="mb-6 max-w-140 border-l-3 border-pri-purple bg-pri-parchment px-4 py-3">
            <div className="mb-0.5 text-xs font-bold tracking-[0.06em] text-pri-purple uppercase">Community-Aggregated Information</div>
            <div className="text-[.82rem] leading-[1.6] text-pri-tan">
              This is not medical advice. Not a doctor. Not Reddit. Not gossip. Curated from clinical research, harm reduction organizations, and
              experienced practitioners. You proceed at your own risk.
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={startQuiz} className="bg-pri-purple px-8 py-3.5 font-mono text-sm font-bold tracking-[0.05em] text-pri-cream uppercase transition-colors hover:bg-pri-purple-mid">
              <span className="inline-flex items-center gap-1.5">
                Begin Assessment
                <ArrowRight aria-hidden="true" className="size-[1em] shrink-0" />
              </span>
            </button>
            <a href="#medicines" className="border-[1.5px] border-pri-ink px-8 py-3.5 font-mono text-sm font-bold tracking-[0.05em] text-pri-ink uppercase">
              Explore Medicines
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="mx-5 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] border-y border-pri-border">
        {[
          { n: String(MEDICINES.length), l: "Plant Medicines" },
          { n: "50+", l: "Quiz Questions" },
          { n: "6", l: "Domains" },
          { n: "∞", l: "Healing Paths" },
        ].map((s) => (
          <div key={s.l} className="border-r border-pri-border px-4 py-6">
            <div className="font-heading text-[clamp(2rem,5vw,2.8rem)] leading-none font-black text-pri-purple">{s.n}</div>
            <div className="mt-1 text-[.7rem] font-semibold tracking-[0.06em] text-pri-tan uppercase">{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── MEDICINE GRID ── */}
      <div id="medicines" className="mx-auto max-w-300 px-5 py-16">
        <CinematicBand
          src="https://cdn.sanity.io/images/a3q1cyqs/production/d1def9c5a5f53e8552abaf70d5770678e3c0b347-1200x669.jpg"
          alt={`${MEDICINES.length} sacred plant medicines arranged on stone tiles`}
          fadeTo="cream"
          heightClass="h-[clamp(200px,30vw,360px)] mb-8"
        />
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-pri-border pb-5">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-pri-purple uppercase">
              <span className="block h-0.5 w-6 bg-pri-purple" />
              The Pharmacopoeia
            </div>
            <h2 className="font-heading text-[clamp(1.5rem,4vw,2.8rem)] text-pri-ink">{MEDICINES.length} Sacred Medicines</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCompareMode(!compareMode);
                if (compareMode) setCompareList([]);
              }}
              className={`border px-4 py-2 text-xs font-bold tracking-[0.06em] uppercase transition-colors ${compareMode ? "border-pri-purple bg-pri-purple text-pri-cream" : "border-[#C8B89A] bg-transparent text-pri-tan"}`}
            >
              {compareMode ? `Compare (${compareList.length}/3)` : "Compare Medicines"}
            </button>
            {!compareMode && <div className="text-right text-[.78rem] text-pri-tan">Click any card to explore</div>}
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-px border border-pri-border bg-pri-border">
          {MEDICINES.map((m) => {
            const inCompare = compareMode && compareList.includes(m.id);
            const isSaved = savedMeds.includes(m.id);
            return (
              <div
                key={m.id}
                className={`group relative cursor-pointer overflow-hidden transition-colors ${inCompare ? "bg-[#F0E8D8] outline-3 -outline-offset-3 outline-pri-purple" : "bg-pri-parchment hover:bg-pri-cream"}`}
              >
                {/* The whole card is this one real button (keyboard users can open it;
                    2026-10-16). The save button sits above it at z-5. */}
                <button
                  type="button"
                  aria-label={compareMode ? `Compare ${m.name}` : `Open ${m.name}`}
                  aria-pressed={compareMode ? inCompare : undefined}
                  onClick={() => {
                    if (compareMode) {
                      setCompareList((prev) => {
                        if (prev.includes(m.id)) return prev.filter((id) => id !== m.id);
                        if (prev.length >= 3) return prev;
                        return [...prev, m.id];
                      });
                    } else {
                      handleMedicineClick(m);
                    }
                  }}
                  className="absolute inset-0 z-1 cursor-pointer focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-pri-purple"
                />
                {inCompare && (
                  <div className="absolute top-1.5 right-1.5 z-5 flex size-6 items-center justify-center rounded-full bg-pri-purple text-[.7rem] font-black text-pri-cream">
                    {compareList.indexOf(m.id) + 1}
                  </div>
                )}
                {!compareMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaved(m.id);
                    }}
                    title={isSaved ? "Remove from saved" : "Save medicine"}
                    className={`absolute top-1.5 right-1.5 z-5 flex size-6.5 items-center justify-center rounded-full text-[.82rem] text-pri-cream transition-opacity ${isSaved ? "bg-pri-purple opacity-100" : "bg-pri-ink/45 opacity-60 hover:opacity-100"}`}
                  >
                    <Heart className="size-3.5" fill={isSaved ? "currentColor" : "none"} />
                  </button>
                )}
                {MEDICINE_IMAGES[m.id] && (
                  <div className="relative h-20 w-full overflow-hidden">
                    <Image
                      src={MEDICINE_IMAGES[m.id]}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 25vw, 120px"
                      className="object-cover object-[center_30%] transition-transform duration-400 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-transparent from-20% to-pri-parchment" />
                  </div>
                )}
                <div className="px-4 pt-3 pb-5">
                  <m.icon aria-hidden="true" className="mb-2 size-6 text-pri-purple" />
                  <div className="mb-1.5 h-0.75 bg-pri-border">
                    <div className={`h-full ${m.intensity > 0.8 ? "bg-[#C62828]" : m.intensity > 0.5 ? "bg-[#E65100]" : "bg-[#6B8F71]"}`} style={{ width: `${m.intensity * 100}%` }} />
                  </div>
                  <div className="mb-0.5 font-heading text-[clamp(.82rem,2vw,.95rem)] leading-[1.3] font-bold text-pri-ink">{m.name}</div>
                  <div className="mb-2 text-[.75rem] font-semibold tracking-[0.05em] text-pri-tan uppercase">{m.src}</div>
                  <div className="flex flex-wrap gap-1">
                    {m.tags.map((t) => (
                      <span key={t} className={`border px-1 py-0.5 text-xs font-bold tracking-[0.06em] uppercase ${TAG_CLASS[t] ?? DEFAULT_TAG_CLASS}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SAVED MEDICINES PANEL ── */}
      {savedMeds.length > 0 && !compareMode && (
        <div data-saved-panel className="border-t-3 border-pri-purple bg-pri-cream px-5 py-8">
          <div className="mx-auto max-w-300">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-pri-purple uppercase">
                  <span className="block h-0.5 w-6 bg-pri-purple" />
                  Your Shortlist
                </div>
                <h3 className="font-heading text-[clamp(1.2rem,3vw,1.8rem)] text-pri-ink">
                  My Saved Medicines <span className="text-[.85rem] font-extrabold text-pri-purple">({savedMeds.length})</span>
                </h3>
              </div>
              <button
                onClick={() => {
                  if (confirm("Clear all saved medicines?")) writeSaved([]);
                }}
                className="border border-[#C8B89A] px-3 py-1.5 text-xs font-bold tracking-[0.06em] text-pri-tan uppercase"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-px border border-pri-border bg-pri-border">
              {savedMeds.map((id) => {
                const m = MEDICINES.find((med) => med.id === id);
                if (!m) return null;
                return (
                  <div key={id} className="relative flex cursor-pointer items-center gap-4 bg-pri-parchment px-5 py-4 transition-colors hover:bg-[#F0E8D8]">
                    <button type="button" aria-label={`Open ${m.name}`} onClick={() => handleMedicineClick(m)} className="absolute inset-0 z-1 cursor-pointer focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-pri-purple" />
                    {MEDICINE_IMAGES[id] && (
                      <div className="relative size-12.5 shrink-0 overflow-hidden rounded-full">
                        <Image src={MEDICINE_IMAGES[id]} alt="" fill sizes="(max-width: 640px) 25vw, 120px" className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <m.icon aria-hidden="true" className="size-5 shrink-0 text-pri-purple" />
                        <span className="font-heading text-sm font-bold text-pri-ink">{m.name}</span>
                      </div>
                      <div className="text-[.75rem] font-semibold tracking-[0.04em] text-pri-tan uppercase">{m.src}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaved(id);
                      }}
                      title="Remove from saved"
                      aria-label={`Remove ${m.name} from saved`}
                      className="relative z-5 flex size-7.5 shrink-0 items-center justify-center rounded-full bg-pri-purple/10 text-[.85rem] text-pri-purple"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-[.78rem] text-pri-tan">Your saved medicines are stored locally in your browser. They will persist across visits but are not synced across devices.</div>
          </div>
        </div>
      )}

      {/* ── COMPARE PANEL ── */}
      {compareMode && compareList.length >= 2 && (
        <div id="compare-panel" className="bg-pri-ink px-5 py-12 text-pri-cream">
          <div className="mx-auto max-w-300">
            <div className="mb-8 flex items-end justify-between border-b border-pri-cream/10 pb-4">
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-pri-purple-light uppercase">
                  <span className="block h-0.5 w-6 bg-pri-purple-light" />
                  Side-by-Side
                </div>
                <h2 className="font-heading text-[clamp(1.3rem,3.5vw,2rem)] text-pri-cream">Medicine Comparison</h2>
              </div>
              <button
                onClick={() => {
                  setCompareMode(false);
                  setCompareList([]);
                }}
                className="border border-pri-cream/20 px-3 py-1.5 text-xs font-bold tracking-[0.06em] text-pri-cream uppercase"
              >
                Close
              </button>
            </div>

            <div className="grid gap-px bg-pri-cream/8" style={{ gridTemplateColumns: `repeat(${compareList.length}, 1fr)` }}>
              {compareList.map((id) => {
                const m = MEDICINES.find((med) => med.id === id)!;
                const ms = getMedicineWithSafety(m);
                return (
                  <div key={id} className="bg-pri-ink p-6">
                    {MEDICINE_IMAGES[id] && (
                      <div className="relative mb-3 h-25 overflow-hidden">
                        <Image src={MEDICINE_IMAGES[id]} alt="" fill sizes="(max-width: 640px) 25vw, 120px" className="object-cover brightness-70" />
                        <div className="absolute inset-0 bg-linear-to-b from-transparent from-40% to-pri-ink" />
                      </div>
                    )}
                    <m.icon aria-hidden="true" className="mx-auto mb-1 size-7 text-pri-purple-light" />
                    <div className="mb-0.5 font-heading text-sm text-pri-cream">{m.name}</div>
                    <div className="mb-4 text-[.75rem] font-semibold tracking-[0.05em] text-pri-cream/60 uppercase">{m.src}</div>

                    <div className="mb-5">
                      <div className="mb-1 text-[.75rem] font-bold tracking-[0.06em] text-pri-cream/60 uppercase">Intensity</div>
                      <div className="h-1 bg-pri-cream/10">
                        <div className={`h-full ${m.intensity > 0.8 ? "bg-pri-purple" : m.intensity > 0.5 ? "bg-pri-purple-mid" : "bg-[#6B8F71]"}`} style={{ width: `${m.intensity * 100}%` }} />
                      </div>
                      <div className="mt-0.5 text-[.75rem] font-bold text-pri-cream">{Math.round(m.intensity * 100)}%</div>
                    </div>

                    <div className="mb-2 text-[.75rem] font-bold tracking-[0.06em] text-pri-cream/60 uppercase">Dimension Scores</div>
                    {(Object.keys(DIM_LABELS) as DimKey[]).map((d) => (
                      <div key={d} className="mb-1.5 flex items-center gap-1.5">
                        <div className="w-12.5 shrink-0 text-[.75rem] text-pri-cream/50 uppercase">{DIM_LABELS[d].split(" ")[0]}</div>
                        <div className="h-0.75 flex-1 bg-pri-cream/8">
                          <div className="h-full bg-pri-purple" style={{ width: `${(m.dims[d] / 10) * 100}%` }} />
                        </div>
                        <div className="w-5 text-right text-[.7rem] font-bold text-pri-cream">{m.dims[d]}</div>
                      </div>
                    ))}

                    <div className="mt-4 flex flex-wrap gap-1">
                      {m.tags.map((t) => (
                        <span key={t} className={`border px-1 py-0.5 text-xs font-bold tracking-[0.06em] uppercase ${TAG_CLASS[t] ?? DEFAULT_TAG_CLASS}`}>
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 border-t border-pri-cream/8 pt-3">
                      <div className="mb-1 text-[.75rem] font-bold tracking-[0.06em] text-pri-cream/60 uppercase">Safety</div>
                      <div className="text-[.75rem] leading-[1.5] text-pri-cream/60">
                        {ms.contraindications.length} contraindications
                        <br />
                        {ms.drugInteractions.length} drug interactions
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCompareMode(false);
                        setCompareList([]);
                        setSelectedMedicine(ms);
                      }}
                      className="mt-4 w-full border border-pri-purple/30 bg-pri-purple/15 py-2 text-[.75rem] font-bold tracking-[0.06em] text-pri-purple-light uppercase"
                    >
                      Full Details
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING COMPARE BAR ── */}
      {compareMode && compareList.length >= 1 && compareList.length < 2 && (
        <div className="fixed inset-x-0 bottom-0 z-100 flex items-center justify-center gap-4 border-t-2 border-pri-purple bg-pri-ink/95 px-5 py-4 backdrop-blur-md">
          <span className="text-[.78rem] text-pri-cream/60">Select {2 - compareList.length} more medicine{compareList.length === 0 ? "s" : ""} to compare</span>
        </div>
      )}
      {compareMode && compareList.length >= 2 && (
        <div className="fixed inset-x-0 bottom-0 z-100 flex items-center justify-center gap-4 border-t-2 border-pri-purple bg-pri-ink/95 px-5 py-4 backdrop-blur-md">
          <span className="text-[.78rem] font-bold text-pri-cream">{compareList.length} medicines selected</span>
          <a href="#compare-panel" className="bg-pri-purple px-5 py-2 text-[.7rem] font-bold tracking-[0.06em] text-pri-cream uppercase">
            View Comparison ↓
          </a>
          <button
            onClick={() => {
              setCompareMode(false);
              setCompareList([]);
            }}
            className="border border-pri-cream/20 px-3 py-1.5 text-xs font-bold text-pri-cream/60"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── MAO-B INTERACTION MATRIX ── */}
      <section id="mao-b" className="bg-pri-ink pb-16 text-pri-cream">
        <CinematicBand
          src="https://cdn.sanity.io/images/a3q1cyqs/production/1ab05902418c91a3fb56a0e3fc940f1e6e9d72b1-1200x669.jpg"
          alt=""
          fadeTo="ink"
          objectPosition="object-center"
          className="brightness-60 contrast-120"
        />
        <div className="mx-auto max-w-250 px-5">
          <div className="mb-8 border-b border-pri-cream/8 pb-5">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-pri-purple-light uppercase">
              <span className="block h-0.5 w-6 bg-pri-purple" />
              Pharmacological Safety
            </div>
            <h2 className="font-heading text-[clamp(1.5rem,4vw,2.8rem)] text-pri-cream">MAO-B Interaction Matrix</h2>
            <p className="mt-3 max-w-175 text-[.9rem] leading-[1.7] text-pri-cream/55">
              MAO-B inhibitors (selegiline, rasagiline, safinamide) are prescribed for Parkinson&apos;s disease and sometimes depression. At therapeutic
              doses, they selectively inhibit MAO-B ... but selectivity is dose-dependent and can be lost. This matrix maps the interaction risk with each
              psychedelic compound.
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-4">
            {[
              { label: "Hard Stop", color: "bg-[#ef4444]" },
              { label: "Caution ... MD Consult", color: "bg-[#f97316]" },
              { label: "Data Limited", color: "bg-[#eab308]" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`size-3 shrink-0 ${l.color}`} />
                <span className="text-[.75rem] font-bold tracking-[0.04em] text-pri-cream/60 uppercase">{l.label}</span>
              </div>
            ))}
          </div>

          <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
            <table className="w-full border-collapse text-[.85rem]">
              <thead>
                <tr className="border-b-2 border-pri-cream/15">
                  <th className="px-4 py-3 text-left text-[.7rem] font-extrabold tracking-[0.08em] text-pri-purple-light uppercase">Compound</th>
                  <th className="px-4 py-3 text-left text-[.7rem] font-extrabold tracking-[0.08em] text-pri-purple-light uppercase">Interaction</th>
                  <th className="px-4 py-3 text-center text-[.7rem] font-extrabold tracking-[0.08em] text-pri-purple-light uppercase">Risk</th>
                </tr>
              </thead>
              <tbody>
                {MAOB_INTERACTIONS.map((row) => (
                  <tr key={row.compound} className="border-b border-pri-cream/6">
                    <td className="px-4 py-3 font-bold whitespace-nowrap text-pri-cream">{row.compound}</td>
                    <td className="px-4 py-3 leading-[1.5] text-pri-cream/60">{row.interaction}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-extrabold tracking-[0.04em] uppercase ${
                          row.riskLevel === "hard_stop" ? "bg-[#ef4444]/15 text-[#F87171]" : row.riskLevel === "caution_md" ? "bg-[#f97316]/15 text-[#f97316]" : "bg-[#eab308]/15 text-[#eab308]"
                        }`}
                      >
                        {row.riskLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <div className="mb-4 text-xs font-extrabold tracking-[0.12em] text-pri-purple-light uppercase">MAO-B Inhibitor Wash-Out Guidance</div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-px border border-pri-cream/8 bg-pri-cream/6">
              {Object.entries(MAOB_WASHOUT).map(([drug, info]) => (
                <div key={drug} className="bg-[#0A0F1E]/40 p-5">
                  <div className="mb-1 font-extrabold text-pri-cream capitalize">{drug}</div>
                  <div className="mb-0.5 text-[.78rem] text-pri-cream/50">Half-life: {info.halfLife}</div>
                  <div className="mb-1.5 text-[.78rem] text-pri-cream/50">Recovery: {info.recoveryTime}</div>
                  <div className="text-[.78rem] leading-[1.5] text-[#f97316]">{info.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MEDICATION INTERACTIONS ── */}
      <section className="bg-pri-cream pb-16">
        <CinematicBand
          src="https://cdn.sanity.io/images/a3q1cyqs/production/c6135e9d655be2df472cf661549acd1d83bae611-1200x669.jpg"
          alt=""
          fadeTo="cream"
          className="brightness-85 contrast-110"
        />
        <div className="mx-auto max-w-250 px-5">
          <div className="mb-8 border-b border-pri-border pb-5">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-pri-purple uppercase">
              <span className="block h-0.5 w-6 bg-pri-purple" />
              Critical Safety Reference
            </div>
            <h2 className="font-heading text-[clamp(1.5rem,4vw,2.4rem)] text-pri-ink">Medication Interaction Guide</h2>
            <p className="mt-3 max-w-175 text-[.9rem] leading-[1.7] text-pri-brown">
              If you take any of these medications, review the guidance carefully before considering any psychedelic experience. This is not exhaustive ...
              always consult your prescribing physician.
            </p>
          </div>

          <div className="grid gap-px border border-pri-border bg-pri-border">
            {MEDICATION_INTERACTIONS.map((med) => {
              const isHardStop = med.risk.includes("LIFE-THREATENING") || med.risk.includes("ABSOLUTE") || med.risk.includes("Seizure");
              return (
                <div key={med.category} className="bg-pri-parchment px-6 py-5">
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div className="font-heading text-base font-extrabold text-pri-ink">{med.category}</div>
                    <div className="flex items-center gap-1 text-xs font-bold tracking-[0.04em] text-pri-purple uppercase">
                      {isHardStop ? (
                        <>
                          <Ban className="size-3.5" /> Hard Stop
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="size-3.5" /> Caution
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mb-1.5 text-[.78rem] text-pri-tan">{med.medications}</div>
                  <div className="mb-1.5 text-[.85rem] leading-[1.6] text-pri-brown">
                    <strong>Risk:</strong> {med.risk}
                  </div>
                  <div className="text-[.85rem] leading-[1.6] text-pri-brown">
                    <strong>Guidance:</strong> {med.guidance}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 overflow-hidden bg-pri-ink">
            <CinematicBand
              src="https://cdn.sanity.io/images/a3q1cyqs/production/64a97b43fdaef33379848914b24515a5b3c9326f-1200x669.jpg"
              alt=""
              fadeTo="ink"
              heightClass="h-[clamp(120px,18vw,200px)]"
              className="brightness-50 contrast-120"
            />
            <div className="px-8 py-6">
              <div className="mb-4 text-xs font-extrabold tracking-[0.12em] text-pri-purple-light uppercase">Crisis Resources</div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                {CRISIS_RESOURCES.map((r) => (
                  <div key={r.name}>
                    <div className="mb-0.5 text-[.82rem] font-bold text-pri-cream">{r.name}</div>
                    <div className="text-[.9rem] font-extrabold text-pri-purple-light">{r.contact}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ASSESSMENT SECTION ── */}
      <section ref={assessmentRef} className="bg-linear-to-b from-pri-ink via-[#2B1B10] to-[#22152A] pb-16 text-pri-cream">
        <CinematicBand
          src="https://cdn.sanity.io/images/a3q1cyqs/production/41677b830bcaf5a36daa30f55dd3346df3163dcb-1200x669.jpg"
          alt=""
          fadeTo="ink"
          heightClass="h-[clamp(200px,28vw,360px)]"
          objectPosition="object-[center_60%]"
          className="brightness-55 contrast-115"
        />
        <div className="mx-auto max-w-300 px-5 py-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-pri-cream/8 pb-5">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-pri-purple-light uppercase">
                <span className="block h-0.5 w-6 bg-pri-purple" />
                Consciousness-Aligned Assessment
              </div>
              <h2 className="font-heading text-[clamp(1.5rem,4vw,2.8rem)] text-pri-cream">Readiness Index</h2>
            </div>
            <div className="text-right text-[.78rem] text-pri-cream/60">{QUESTIONS.length} Questions · 6 Domains</div>
          </div>
        </div>

        <div className="mx-auto max-w-180">
          {/* PHILOSOPHY */}
          {state === "philosophy" && (
            <div className="px-5 py-6 text-center">
              <div className="mb-8 text-[.6rem] tracking-[0.28em] text-brand-gold-light uppercase">Tony Greenberg · The Diode of Perception</div>
              <div className="mx-auto max-w-160 text-left">
                {PHILOSOPHY_PARAGRAPHS.map((para, i) => (
                  <p
                    key={para.text.slice(0, 20)}
                    className={`mb-6 font-heading text-[clamp(1rem,2.8vw,1.2rem)] leading-[1.85] ${para.italic ? "italic" : ""}`}
                    style={{ color: `rgba(244,240,232,${0.92 - i * 0.05})` }}
                  >
                    {i === 0 && <span className="float-left mt-1 mr-1 font-heading text-[clamp(2rem,5vw,2.8rem)] leading-none text-brand-gold-light">T</span>}
                    {i === 0 ? para.text.slice(1) : para.text}
                  </p>
                ))}
              </div>
              <div className="my-8 h-px bg-linear-to-r from-transparent via-brand-gold/30 to-transparent" />
              <div className="mx-auto mb-8 max-w-140 border border-brand-gold/20 bg-brand-gold/7 p-6 text-left">
                <div className="mb-3 text-[.6rem] tracking-[0.2em] text-brand-gold-light uppercase">What the Numbers Are Saying</div>
                <p className="m-0 text-[clamp(.85rem,2.2vw,.95rem)] leading-[1.8] text-pri-cream/70">
                  You are the instrument. Every medicine, every ceremony, every facilitator conversation begins with one question: what is the current
                  condition of the thing being played? This assessment exists to answer that — not to gatekeep, but to give you an honest map before you
                  walk into territory that rewards preparation and punishes shortcuts.
                </p>
              </div>
              <button onClick={() => setState("intro")} className="bg-linear-to-br from-[#b45309] to-[#d97706] px-10 py-4 text-[clamp(1rem,2.5vw,1.1rem)] font-bold text-white uppercase">
                <span className="inline-flex items-center gap-1.5">
                  See Where You Actually Stand
                  <ArrowRight aria-hidden="true" className="size-[1em] shrink-0" />
                </span>
              </button>
              <div className="mt-6">
                <Link href="https://tonygreenberg.com/the-philosophy" className="text-[.75rem] tracking-[0.1em] text-brand-gold-light">
                  <span className="inline-flex items-center gap-1.5">
                    Read the full philosophy
                    <ArrowRight aria-hidden="true" className="size-[1em] shrink-0" />
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* INTRO */}
          {state === "intro" && (
            <div className="px-5 py-8 text-center">
              <Star className="mx-auto mb-4 size-11 text-brand-gold-light" fill="currentColor" />
              <h2 className="mb-4 font-heading text-[clamp(1.5rem,4vw,2rem)] text-pri-cream">Your Readiness Assessment</h2>
              <p className="mx-auto mb-8 max-w-130 text-[clamp(.88rem,2.5vw,1rem)] text-pri-cream/65">
                Most people walk into these experiences with a plan. Very few walk in with a map. This is the map ... {QUESTIONS.length} questions across 6
                dimensions. No right answers. What you get at the end is the honest picture of where you actually are, not where you wish you were.
              </p>
              <div className="my-6 grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-px border border-pri-cream/10 bg-pri-cream/8">
                {(Object.keys(DIM_LABELS) as DimKey[]).map((d) => (
                  <div key={d} className="bg-[#0A0F1E]/40 px-1.5 py-3 text-center">
                    <DimIcon dim={d} className="mx-auto mb-0.5 size-5 text-pri-purple-light" />
                    <div className="text-[.58rem] font-bold tracking-[0.06em] text-pri-cream/60 uppercase">{DIM_LABELS[d]}</div>
                  </div>
                ))}
              </div>
              <button onClick={startQuiz} className="bg-pri-ink px-8 py-3.5 text-sm font-bold tracking-wide text-pri-cream uppercase ring-1 ring-pri-cream/20">
                <span className="inline-flex items-center gap-1.5">
                  Begin {QUESTIONS.length}-Question Assessment
                  <ArrowRight aria-hidden="true" className="size-[1em] shrink-0" />
                </span>
              </button>
            </div>
          )}

          {/* QUIZ */}
          {state === "quiz" && (
            <div className="px-5">
              <div className="mb-8 flex items-center gap-4">
                <div className="h-0.75 flex-1 bg-pri-cream/10">
                  <div className="h-full bg-pri-purple transition-[width] duration-400" style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }} />
                </div>
                <div className="text-[.78rem] font-bold whitespace-nowrap text-pri-cream/60">
                  {currentQ + 1} / {QUESTIONS.length}
                </div>
              </div>

              <div className="border border-pri-cream/8 bg-pri-cream/4 p-[clamp(1.5rem,4vw,2.25rem)]">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-[0.14em] text-pri-purple-light uppercase">
                  <DimIcon dim={domain.dim} className="size-4 shrink-0" />
                  {domain.category}
                </div>
                <div className={`font-heading text-[clamp(1rem,3vw,1.2rem)] leading-[1.45] font-semibold text-pri-cream ${domain.facilitatedNote ? "mb-4" : "mb-8"}`}>
                  {domain.text}
                  {domain.facilitatedNote && <span className="ml-1 text-pri-purple-light">*</span>}
                </div>
                {domain.facilitatedNote && (
                  <div className="mb-6 rounded bg-pri-purple/12 p-3.5 text-[.78rem] leading-[1.5] text-pri-cream/65 ring-1 ring-pri-purple/30">
                    <span className="font-bold text-pri-purple-light">* Facilitated setting: </span>
                    {domain.facilitatedNote} Score 10 if you are working with a licensed facility.
                  </div>
                )}
                <div className="mb-2.5 flex justify-between">
                  <span className="text-xs font-bold tracking-[0.06em] text-pri-cream/60 uppercase">Least Likely</span>
                  <span className="text-xs font-bold tracking-[0.06em] text-pri-cream/60 uppercase">Most Likely</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={answers[currentQ]}
                  onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                  className="h-7 w-full accent-pri-purple"
                />
                <div className="mt-3 text-center text-[clamp(.82rem,2.5vw,.9rem)] font-semibold text-pri-cream/50">
                  <span className="text-pri-purple-light">{answers[currentQ]}/10</span> ... {sliderLabel}
                </div>
              </div>

              <div className="mt-6 flex justify-between gap-3">
                <button
                  onClick={prevQuestion}
                  disabled={currentQ === 0}
                  className={`border-[1.5px] px-5 py-3 text-sm font-bold ${currentQ === 0 ? "border-pri-cream/10 text-pri-cream/30" : "border-pri-cream/20 text-pri-cream"}`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowLeft aria-hidden="true" className="size-[1em] shrink-0" />
                    Back
                  </span>
                </button>
                <button onClick={nextQuestion} className="max-w-60 flex-1 justify-center bg-pri-purple px-6 py-3 text-sm font-bold text-pri-cream">
                  <span className="inline-flex items-center gap-1.5">
                    {currentQ === QUESTIONS.length - 1 ? "A Few More Questions" : "Next"}
                    <ArrowRight aria-hidden="true" className="size-[1em] shrink-0" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* PATHWAY */}
          {state === "pathway" && pathwayQ && (
            <div className="px-5">
              <div className="mb-8 text-center">
                <div className="mb-2 text-xs font-bold tracking-[0.14em] text-pri-purple-light uppercase">Part 2 of 2</div>
                <h3 className="mb-2 font-heading text-[clamp(1.2rem,3vw,1.6rem)] text-pri-cream">How You Want to Go</h3>
                <p className="mx-auto max-w-120 text-[.85rem] text-pri-cream/50">
                  Eight questions about what matters to you ... not what you should want. These don&apos;t change your readiness score. They help point you
                  somewhere real.
                </p>
              </div>
              <div className="mb-8 flex items-center gap-4">
                <div className="h-0.75 flex-1 bg-pri-cream/10">
                  <div className="h-full bg-pri-purple-light transition-[width] duration-400" style={{ width: `${((currentPathwayQ + 1) / PATHWAY_QUESTIONS.length) * 100}%` }} />
                </div>
                <div className="text-[.78rem] font-bold whitespace-nowrap text-pri-cream/60">
                  {currentPathwayQ + 1} / {PATHWAY_QUESTIONS.length}
                </div>
              </div>
              <div className="border border-pri-purple-light/15 bg-pri-cream/4 p-[clamp(1.5rem,4vw,2.25rem)]">
                <div className="mb-3 text-xs font-bold tracking-[0.14em] text-pri-purple-light uppercase">What Matters to You</div>
                <div className={`font-heading text-[clamp(1rem,3vw,1.2rem)] leading-[1.45] font-semibold text-pri-cream ${pathwayQ.note ? "mb-4" : "mb-8"}`}>{pathwayQ.text}</div>
                {pathwayQ.note && <div className="mb-6 text-[.78rem] text-pri-cream/60 italic">{pathwayQ.note}</div>}
                <div className="mb-2.5 flex justify-between">
                  <span className="max-w-[45%] text-[.72rem] font-bold text-pri-cream/60">{pathwayQ.lowLabel}</span>
                  <span className="max-w-[45%] text-right text-[.72rem] font-bold text-pri-cream/60">{pathwayQ.highLabel}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={pathwayAnswers[pathwayQ.id] ?? 5}
                  onChange={(e) => setPathwayAnswers((prev) => ({ ...prev, [pathwayQ.id]: parseInt(e.target.value) }))}
                  className="h-7 w-full accent-pri-purple-light"
                />
                <div className="mt-3 text-center text-[clamp(.82rem,2.5vw,.9rem)] font-semibold text-pri-cream/50">
                  <span className="text-pri-purple-light">{pathwayAnswers[pathwayQ.id] ?? 5}/10</span>
                </div>
              </div>
              <div className="mt-6 flex justify-between gap-3">
                <button onClick={prevPathwayQuestion} className="border-[1.5px] border-pri-cream/20 px-5 py-3 text-sm font-bold text-pri-cream">
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowLeft aria-hidden="true" className="size-[1em] shrink-0" />
                    Back
                  </span>
                </button>
                <button onClick={nextPathwayQuestion} className="max-w-60 flex-1 justify-center bg-pri-purple px-6 py-3 text-sm font-bold text-pri-cream">
                  <span className="inline-flex items-center gap-1.5">
                    {currentPathwayQ === PATHWAY_QUESTIONS.length - 1 ? "See My Results" : "Next"}
                    <ArrowRight aria-hidden="true" className="size-[1em] shrink-0" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* RESULTS */}
          {state === "results" && results && (
            <div className="px-5">
              <div className="mb-8 border-b border-pri-cream/8 pt-8 pb-10 text-center">
                <div className="text-xs font-extrabold tracking-[0.14em] text-pri-purple-light uppercase">Where You Stand</div>
                <div className="my-2 font-heading text-[clamp(4rem,12vw,6rem)] leading-none font-black text-pri-purple-light">{results.overall}</div>
                <div className="mb-2 text-base font-bold tracking-[0.08em] text-pri-cream uppercase">{results.level.label}</div>
                <div className="mx-auto max-w-110 text-[clamp(.82rem,2.5vw,.9rem)] text-pri-cream/55">{results.level.description}</div>
              </div>

              <div className="mb-4 text-xs font-extrabold tracking-[0.14em] text-pri-purple-light uppercase">Six Dimensions</div>
              <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-px border border-pri-cream/8 bg-pri-cream/6">
                {(Object.keys(results.dimScores) as DimKey[]).map((d) => (
                  <div key={d} className="bg-[#0A0F1E]/40 px-2 py-4 text-center">
                    <div className="mb-1 inline-flex items-center gap-1.5 text-[.75rem] font-bold tracking-[0.08em] text-pri-cream/60 uppercase">
                      <DimIcon dim={d} className="size-3.5 shrink-0" />
                      {DIM_LABELS[d]}
                    </div>
                    <div className="font-heading text-[clamp(1.4rem,4vw,1.9rem)] font-black text-pri-cream">
                      {results.dimScores[d]}
                      <small className="text-[.8rem] text-pri-purple-light">/100</small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4 text-xs font-extrabold tracking-[0.14em] text-pri-purple-light uppercase">Where Your Profile Points</div>
              <div className="mb-4 border border-pri-purple/30 bg-pri-purple/10 px-5 py-4">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-extrabold tracking-[0.06em] text-pri-purple-light uppercase">
                  <AlertTriangle className="size-3.5" />
                  Review Safety Data Before Trying Any Medicine
                </div>
                <div className="text-[.82rem] leading-[1.6] text-pri-cream/60">
                  Click any medicine below to view its full contraindications, drug interactions, and side effects. This information is essential before
                  making any decisions.
                </div>
              </div>

              <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-px border border-pri-cream/8 bg-pri-cream/6">
                {results.topMatches.map((m, i) => (
                  <div key={m.id} className="relative cursor-pointer bg-[#0A0F1E]/40 px-4 py-6 text-center transition-colors hover:bg-[#0A0F1E]/60">
                    <button type="button" aria-label={`Open ${m.name}: match #${i + 1}`} onClick={() => setSelectedMedicine(m)} className="absolute inset-0 z-1 cursor-pointer focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-pri-purple" />
                    <div className="absolute top-2 left-2 text-xs font-extrabold tracking-[0.1em] text-pri-purple-light">#{i + 1}</div>
                    <m.icon aria-hidden="true" className="mx-auto mb-1.5 size-7 text-pri-purple-light" />
                    <div className="mb-1.5 font-heading text-[clamp(.82rem,2vw,1rem)] leading-[1.3] font-bold text-pri-cream">{m.name}</div>
                    <div className="my-1.5 h-0.5 bg-pri-cream/8">
                      <div className="h-full bg-pri-purple transition-[width] duration-1000" style={{ width: `${m.matchScore}%` }} />
                    </div>
                    <div className="text-[.62rem] font-semibold tracking-[0.06em] text-pri-cream/60 uppercase">
                      {m.matchScore >= 80 ? "this one knows you" : m.matchScore >= 60 ? "worth a real look" : "keep it on the radar"}
                    </div>
                  </div>
                ))}
              </div>

              <CinematicBand
                src="https://cdn.sanity.io/images/a3q1cyqs/production/6d400ad9951b52a6748ee84bb1aaff7731880336-1200x669.jpg"
                alt=""
                fadeTo="ink"
                heightClass="h-[clamp(140px,20vw,240px)] mb-6"
                className="brightness-50 contrast-115"
              />
              <div className="mb-4 text-xs font-extrabold tracking-[0.14em] text-pri-purple-light uppercase">Where This Could Go</div>
              {results.sequence.map((s, i) => (
                <div key={s.name} className="mb-3 flex flex-wrap items-start gap-4 border border-pri-cream/8 bg-pri-cream/4 p-[clamp(1.25rem,3vw,1.75rem)]">
                  <div className="min-w-8 font-heading text-2xl leading-none font-black text-pri-cream/7">{String(i + 1).padStart(2, "0")}</div>
                  <div className="min-w-50 flex-1">
                    <div className="mb-0.5 flex items-center gap-2 font-heading text-[clamp(.95rem,2.5vw,1.1rem)] font-bold text-pri-cream">
                      <s.icon aria-hidden="true" className="size-5 shrink-0 text-pri-purple-light" />
                      {s.name}
                    </div>
                    <div className="mb-1.5 text-[.7rem] font-bold tracking-[0.08em] text-pri-purple-light uppercase">{s.time}</div>
                    <div className="text-[clamp(.8rem,2vw,.85rem)] leading-[1.55] text-pri-cream/50">{s.why}</div>
                  </div>
                  <div className="min-w-25 text-right">
                    <div className="font-heading text-[clamp(.88rem,2vw,1rem)] font-bold text-pri-cream">{s.cost}</div>
                    <div className="text-[.75rem] font-semibold tracking-[0.06em] text-pri-cream/30 uppercase">Est. entry cost</div>
                  </div>
                </div>
              ))}

              <div className="mt-8 flex flex-wrap justify-center gap-3 pb-8 text-center">
                <button onClick={exportPDF} className="flex items-center justify-center gap-2 bg-pri-purple px-8 py-3.5 font-mono text-sm font-bold tracking-[0.05em] text-pri-cream uppercase">
                  <FileText className="size-4" />
                  Save My Results
                </button>

                {!referralSent ? (
                  <div className="mt-4 w-full border border-pri-purple-light/25 bg-pri-purple-light/8 p-5 text-left">
                    <div className="mb-2 text-xs font-bold tracking-[0.1em] text-pri-purple-light uppercase">Want a personal introduction?</div>
                    <p className="mb-4 text-[.82rem] leading-[1.55] text-pri-cream/60">
                      Tony reviews these himself. If you&apos;d like him to connect you with a vetted facility in your region ... no spam, no lead gen, just
                      a personal introduction ... check the box below.
                    </p>
                    <label className={`flex cursor-pointer items-start gap-2.5 text-[.82rem] text-pri-cream/75 ${referralConsent ? "mb-4" : ""}`}>
                      <input type="checkbox" checked={referralConsent} onChange={(e) => setReferralConsent(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-pri-purple-light" />
                      <span>Yes, I&apos;d like Tony to connect me with a vetted facility in my region.</span>
                    </label>
                    {referralConsent && (
                      <div className="flex flex-col gap-2.5">
                        <input
                          type="text"
                          placeholder="Your name"
                          value={referralName}
                          onChange={(e) => setReferralName(e.target.value)}
                          className="rounded border border-pri-purple-light/30 bg-pri-cream/6 px-3.5 py-2.5 text-[.82rem] text-pri-cream outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <input
                          type="email"
                          placeholder="Your email"
                          value={referralEmail}
                          onChange={(e) => setReferralEmail(e.target.value)}
                          className="rounded border border-pri-purple-light/30 bg-pri-cream/6 px-3.5 py-2.5 text-[.82rem] text-pri-cream outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <input
                          type="text"
                          placeholder="Your region (e.g. New York, London, Sydney)"
                          value={referralRegion}
                          onChange={(e) => setReferralRegion(e.target.value)}
                          className="rounded border border-pri-purple-light/30 bg-pri-cream/6 px-3.5 py-2.5 text-[.82rem] text-pri-cream outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <button
                          disabled={!referralEmail || !referralRegion}
                          onClick={handleReferralSubmit}
                          className={`self-start bg-pri-purple px-5 py-2.5 text-[.8rem] font-bold text-pri-cream ${!referralEmail || !referralRegion ? "opacity-50" : ""}`}
                        >
                          Send Introduction Request
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 w-full border border-pri-purple-light/25 bg-pri-purple-light/8 p-5 text-center">
                    <CheckCircle2 className="mx-auto mb-1 size-6 text-pri-purple-light" />
                    <div className="text-[.85rem] font-bold text-pri-purple-light">Your email client should be open.</div>
                    <div className="mt-1 text-[.78rem] text-pri-cream/50">Send it and Tony will reach out personally when he has a match in your region.</div>
                  </div>
                )}

                <Link href="/pri-calibration" className="flex items-center justify-center gap-2 bg-linear-to-br from-pri-purple to-pri-purple-light px-6 py-3 text-sm font-bold text-pri-cream uppercase">
                  <Target className="size-4" />
                  Calibrate My Results
                </Link>

                <button onClick={resetQuiz} className="border-[1.5px] border-pri-cream/20 px-6 py-3 text-sm font-bold text-pri-cream uppercase">
                  Retake Assessment
                </button>
                {savedMeds.length > 0 && (
                  <button
                    onClick={() => document.querySelector("[data-saved-panel]")?.scrollIntoView({ behavior: "smooth" })}
                    className="flex items-center justify-center gap-2 border-[1.5px] border-pri-purple/40 px-6 py-3 text-sm font-bold text-pri-purple-light uppercase"
                  >
                    <Heart className="size-4" fill="currentColor" />
                    View Saved ({savedMeds.length})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── SHARE BAR ── */}
      <section className="border-t border-pri-purple/15 bg-pri-purple/6 px-5 py-8">
        <div className="mx-auto max-w-160">
          <PriShareBar />
        </div>
      </section>

      {/* ── IMPACTSOUL CTA ── */}
      <section className="border-t border-pri-purple/30 bg-linear-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e] px-5 py-16 text-center">
        <div className="mx-auto max-w-160">
          <div className="mb-4 text-xs font-bold tracking-[0.12em] text-[#9b59b6] uppercase">Next Step</div>
          <h2 className="mb-4 font-heading text-[clamp(1.6rem,4vw,2.4rem)] leading-[1.25] font-bold text-pri-cream">
            Your ImpactSoul Score
            <br />
            <span className="text-[#9b59b6]">measures what this can&apos;t.</span>
          </h2>
          <p className="mx-auto mb-8 max-w-130 text-base leading-[1.7] text-pri-cream/70">
            The PRI tells you which medicine fits your biology. The ImpactSoul Score tells you where you are in your evolution ... and what kind of capital,
            community, and consciousness work you&apos;re actually ready for.
          </p>
          <a
            href="https://impactsoul.is"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded bg-linear-to-br from-pri-purple to-[#9b59b6] px-10 py-4 text-[.85rem] font-bold tracking-[0.1em] text-pri-cream uppercase shadow-[0_4px_24px_rgba(107,33,168,0.4)]"
          >
            <span className="inline-flex items-center gap-1.5">
              Get Your ImpactSoul Score
              <ArrowRight aria-hidden="true" className="size-[1em] shrink-0" />
            </span>
          </a>
          <div className="mt-5 text-xs tracking-[0.04em] text-pri-cream/60">Free · 8 minutes · No account required</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative bg-pri-ink py-12 text-center text-pri-cream/60">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="https://cdn.sanity.io/images/a3q1cyqs/production/9fbe29d4f1af581002b17e7b74c67b31b4b8853a-1200x669.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-20 contrast-110"
          />
          <div className="absolute inset-0 bg-linear-to-b from-pri-ink via-transparent to-pri-ink" />
        </div>
        <div className="relative z-10 px-5">
          <div className="mb-1 font-heading text-[1.3rem] text-pri-cream">
            ImpactSoul <span className="text-pri-purple-light">×</span> Find My Medicine
          </div>
          <div className="mb-3 text-[.78rem]">A consciousness-aligned capital initiative</div>
          <div className="my-4 flex flex-wrap justify-center gap-6">
            <a href="https://tonygreenberg.com" className="text-[.75rem] font-semibold tracking-[0.06em] text-pri-cream/60 uppercase">
              TonyGreenberg.com
            </a>
            <a href="https://impactsoul.is" target="_blank" rel="noopener noreferrer" className="text-[.75rem] font-semibold tracking-[0.06em] text-pri-cream/60 uppercase">
              ImpactSoul.is
            </a>
          </div>

          <div className="mx-auto mt-6 max-w-150 border-t border-pri-cream/6 pt-5">
            <div className="mb-2 text-xs font-bold tracking-[0.08em] text-pri-purple-light uppercase">Legal Disclaimer</div>
            <div className="text-[.7rem] leading-[1.8] text-pri-cream/60">
              The Psychedelic Readiness Index is community-aggregated information compiled for educational and harm reduction purposes only. It does not
              constitute medical advice, diagnosis, or treatment. No medicine, provider, or protocol listed here constitutes an endorsement or
              recommendation. Always consult qualified healthcare professionals before engaging with any psychedelic substance. You proceed entirely at your
              own risk. The creators, contributors, and operators of this tool assume no liability for any outcomes. Many substances discussed are illegal
              in various jurisdictions. You are responsible for knowing and following the laws where you live.
            </div>
          </div>
        </div>
      </footer>

      {showDisclaimer && !hasConsent && <DisclaimerGate onConsent={handleConsentComplete} />}

      {selectedMedicine && <MedicineModal medicine={selectedMedicine} onClose={() => setSelectedMedicine(null)} isSaved={savedMeds.includes(selectedMedicine.id)} onToggleSaved={toggleSaved} />}
    </div>
    {results && reportDate && (
      <PriReport results={results} date={reportDate} savedMeds={MEDICINES.filter((m) => savedMeds.includes(m.id))} />
    )}
    </>
  );
}
