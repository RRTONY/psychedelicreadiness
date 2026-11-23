import { MEDICINES, QUESTIONS, type DimKey, type Medicine, type MedicineWithSafety, type Question } from "./pri-data";
import { SAFETY_DATA } from "./pri-safety-data";
import { Bean, HeartHandshake, Leaf, Microscope, Pill, Sparkles, Wind, type LucideIcon } from "lucide-react";

// Ported from legacy client/src/pages/pri/PsychedelicReadinessIndex.tsx —
// the real safety-data merge and the real 6-dimension scoring engine
// (readiness levels, medicine match scoring, healing-sequence
// recommendations), unchanged. Extracted into a plain module so both the
// Server Component page and client islands can use it — same RSC-boundary
// lesson already applied to `kava-science.ts`. Legacy's `getSessionId()`
// (a `sessionStorage`-backed id used only to correlate `trpc` mutation
// calls with a backend this migration never built) is dropped entirely
// along with those calls — see the correction/referral forms, which use a
// `mailto:` fallback instead and need no session id.
// Shown for a medicine with no reviewed safety record (and no warning of its own). Not a loading
// state: nothing more is coming until the data is reviewed, so no spinner and no "pending".
export const UNREVIEWED_SAFETY_WARNING =
  "Safety data for this substance has not been reviewed yet. Always consult a qualified healthcare professional.";
export const UNREVIEWED_SAFETY_LIST = "Not reviewed yet. Ask a licensed clinician before anything else.";

export function getMedicineWithSafety(m: Medicine): MedicineWithSafety {
  const reviewed = SAFETY_DATA[m.id];
  if (reviewed) return { ...m, ...reviewed, safetyReviewed: true };
  return {
    ...m,
    contraindications: [],
    sideEffects: [],
    drugInteractions: [],
    safetyWarning: m.safetyWarning || UNREVIEWED_SAFETY_WARNING,
    legalStatus: "Varies by jurisdiction. Research local laws.",
    safetyReviewed: false,
  };
}

type DimScores = Record<DimKey, number>;

export interface ScoredMedicine extends MedicineWithSafety {
  matchScore: number;
}

export interface ReadinessLevel {
  threshold: number;
  label: string;
  description: string;
}

export const READINESS_LEVELS: ReadinessLevel[] = [
  { threshold: 85, label: "Ready to Go Deep", description: "You have built something real. The high-intensity work... ayahuasca, iboga, 5-MeO... is accessible to you with the right people. Do not skip the facilitation. The container matters as much as the medicine." },
  { threshold: 70, label: "Strong Ground", description: "Most of the foundation is there. Psilocybin, MDMA therapy, San Pedro... these are honest next steps. A few dimensions are worth tending before you go further. You are closer than you think." },
  { threshold: 55, label: "Building Toward It", description: "The container is not quite ready yet. Start with lower-intensity medicines. Do the preparation work like it matters. Because it does. Every single time." },
  { threshold: 40, label: "Not Yet. And That Is Honest.", description: "The groundwork is still ahead of you. Breathwork, microdosing, somatic practice, a real integration community. These are not consolation prizes. They are the work. The actual work." },
  { threshold: 0, label: "Start Here", description: "This is where it begins. And beginning here is the right call. Cacao ceremony, breathwork, meditation, intentional cannabis. Build from the ground up. The deeper work will wait for you. It always does." },
];

/**
 * A hard-stop statement ("I have no history of heart attack...") counts as cleared only at
 * "Often true" or higher (7+ on the 1-10 slider, see SLIDER_LABELS). Anything lower, or no
 * answer at all, pauses the personal scores. Added 2026-11-11 after an audit profile with a
 * negative cardiac answer still got 99/100 overall and an 87/100 ibogaine match.
 */
export const HARD_STOP_CLEAR_MIN = 7;

/** The hard-stop statements this answer set does not clearly clear, in question order. */
export function getHardStops(answers: readonly (number | null | undefined)[]): Question[] {
  return QUESTIONS.filter((q, i) => {
    if (q.severity !== "hard_stop") return false;
    const a = answers[i];
    return typeof a !== "number" || !Number.isFinite(a) || a < HARD_STOP_CLEAR_MIN;
  });
}

/** True only when every readiness question has an explicit answer. */
export function isComplete(answers: readonly (number | null | undefined)[]): answers is number[] {
  return QUESTIONS.every((_, i) => typeof answers[i] === "number" && Number.isFinite(answers[i]));
}

export function computeScores(answers: readonly (number | null | undefined)[]): {
  dimScores: DimScores;
  overall: number;
  level: ReadinessLevel;
  topMatches: ScoredMedicine[];
  sequence: { icon: LucideIcon; name: string; time: string; why: string; cost: string }[];
  /** Hard-stop statements not cleared. When non-empty the UI must not show the scores. */
  hardStops: Question[];
} {
  const dims: Record<DimKey, number[]> = { medical: [], pharmacological: [], psychological: [], intention: [], setting: [], integration: [] };
  // Skip missing answers (a short array) so they can't turn a dimension into NaN;
  // a dimension with no answers falls back to 50 below.
  QUESTIONS.forEach((q, i) => {
    const a = answers[i];
    if (typeof a === "number" && Number.isFinite(a)) dims[q.dim].push(a);
  });

  const dimScores = {} as DimScores;
  (Object.keys(dims) as DimKey[]).forEach((d) => {
    dimScores[d] = dims[d].length > 0 ? Math.round((dims[d].reduce((a, b) => a + b, 0) / dims[d].length) * 10) : 50;
  });

  const dimKeys = Object.keys(dims) as DimKey[];
  const overall = Math.round(Object.values(dimScores).reduce((a, b) => a + b, 0) / dimKeys.length);
  const level = READINESS_LEVELS.find((l) => overall >= l.threshold) || READINESS_LEVELS[READINESS_LEVELS.length - 1];

  // "Hard Stop" entries (Brugmansia, Datura) are deliriants listed only as a
  // warning: they must never be recommended, whatever the answers.
  // Medicines without reviewed safety data are withheld from every personal match, the report
  // and the sequence (Tony's hold #48 on tonygreenberg.com, copied here 2026-11-18).
  const allMeds = MEDICINES.filter((m) => m.complexityLevel !== "Hard Stop" && SAFETY_DATA[m.id]).map(getMedicineWithSafety);
  const scored: ScoredMedicine[] = allMeds
    .map((m) => {
      let s = 0;
      const scoredDims = Object.keys(dimScores) as DimKey[];
      scoredDims.forEach((d) => {
        const req = (m.dims[d] || 0.5) * 100;
        const r = dimScores[d];
        const delta = r - req;
        s += delta > 0 ? 10 - Math.min(delta / 10, 5) : Math.max(10 + delta / 3, 0);
      });
      // Each dimension adds at most 10 points, so s / (dims x 10) is a real
      // 0-100% (legacy's s / 5 capped every score at 12%).
      return { ...m, matchScore: Math.max(0, Math.min(100, Math.round((s / (scoredDims.length * 10)) * 100))) };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const top = scored[0];
  const sequence =
    overall >= 75
      ? [
          { icon: Sparkles, name: "Psilocybin: research and risk profile", time: "For information", why: "This database score identifies a profile match only; it does not establish readiness, safety, or likely benefit. Review clinical evidence and personal risks with a licensed clinician.", cost: "$400–$2,000" },
          { icon: top.icon, name: top.name + " (profile and evidence)", time: "For information", why: "This profile ranked among your database matches. A score does not establish suitability; verify research, legal status, and personal risks.", cost: top.pricing[1]?.amount || "$500–$3,000" },
          { icon: Leaf, name: "Ayahuasca: traditions, research, and risks", time: "For information", why: "Practices are diverse and community-specific. Do not treat this entry as an invitation or infer readiness from prior experiences.", cost: "$2,000–$6,000" },
          { icon: HeartHandshake, name: "MDMA: research and risk profile", time: "For information", why: "Research status and availability vary. A database profile is not a treatment recommendation; review current evidence and personal risks with qualified clinicians.", cost: "$500–$8,000" },
        ]
      : overall >= 55
        ? [
            { icon: Wind, name: "Breathwork: methods and considerations", time: "For information", why: "Some people explore breathwork as a substance-free practice. Effects and contraindications vary; this database cannot determine whether it suits you.", cost: "$100–$400" },
            { icon: Microscope, name: "Psilocybin microdosing: evidence and risks", time: "For information", why: "Evidence about benefits and safety is limited. This site does not recommend a dose or schedule; review current research, legal status, and personal risks.", cost: "$100–$300/mo" },
            { icon: Sparkles, name: "Psilocybin: research and risk profile", time: "For information", why: "This is an educational profile, not a dose or treatment recommendation. Review current evidence and personal risks with a qualified clinician.", cost: "$400–$1,500" },
            { icon: top.icon, name: top.name + " (profile and evidence)", time: "For information", why: "This profile ranked among your database matches. A score does not establish suitability; verify research, legal status, and personal risks.", cost: top.pricing[1]?.amount || "$1,000–$4,000" },
          ]
        : [
            { icon: Bean, name: "Cacao: evidence and risks", time: "For information", why: "Cacao is not risk-free or a readiness screen. Effects, tolerability, and interactions vary; review personal risks with a clinician.", cost: "$50–$200" },
            { icon: Wind, name: "Breathwork: methods and considerations", time: "For information", why: "Some people explore breathwork as a substance-free practice. Effects and contraindications vary; this database cannot determine whether it suits you.", cost: "$50–$200" },
            { icon: Microscope, name: "Psilocybin microdosing: evidence and risks", time: "For information", why: "Evidence about benefits and safety is limited. This site does not recommend a dose or schedule; review current research, legal status, and personal risks.", cost: "$100–$300/mo" },
            { icon: Pill, name: "Ketamine-assisted therapy: evidence and access", time: "For information", why: "Availability and evidence vary by jurisdiction, indication, and clinical protocol. This is not an instruction to begin treatment; discuss options with qualified clinicians.", cost: "$400–$800/session" },
          ];

  return { dimScores, overall, level, topMatches: scored.slice(0, 6), sequence, hardStops: getHardStops(answers) };
}

// Precomposed literal classes for the 5 known tags — small enumerable set,
// same Tailwind static-scanner rule enforced throughout this migration.
export const TAG_CLASS: Record<string, string> = {
  ceremony: "border-[#C9A84C] text-[#7A6425]",
  clinical: "border-[#2A7A7A] text-[#2A7A7A]",
  micro: "border-[#6B8F71] text-[#5A785F]",
  intense: "border-pri-purple text-pri-purple",
  gentle: "border-[#6B8F71] text-[#5A785F]",
};

export const DEFAULT_TAG_CLASS = "border-pri-border text-pri-tan";
