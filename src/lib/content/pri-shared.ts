import { MEDICINES, QUESTIONS, type DimKey, type Medicine, type MedicineWithSafety } from "./pri-data";
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
export function getMedicineWithSafety(m: Medicine): MedicineWithSafety {
  const safety = SAFETY_DATA[m.id] || {
    contraindications: ["Data pending ... consult a healthcare professional"],
    sideEffects: ["Data pending"],
    drugInteractions: ["Data pending"],
    safetyWarning: "Safety data is being compiled. Always consult a qualified healthcare professional.",
    legalStatus: "Varies by jurisdiction. Research local laws.",
  };
  return { ...m, ...safety };
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

export function computeScores(answers: number[]): {
  dimScores: DimScores;
  overall: number;
  level: ReadinessLevel;
  topMatches: ScoredMedicine[];
  sequence: { icon: LucideIcon; name: string; time: string; why: string; cost: string }[];
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
  const allMeds = MEDICINES.filter((m) => m.complexityLevel !== "Hard Stop").map(getMedicineWithSafety);
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
          { icon: Sparkles, name: "Psilocybin (Facilitated Ceremony)", time: "Now — within 3 months", why: "Your readiness supports deep ceremonial work. Begin here to calibrate the psychedelic space and build your integration practice before going further.", cost: "$400–$2,000" },
          { icon: top.icon, name: top.name, time: "3–6 months after first session", why: "Your highest-alignment medicine. Come to it after integrating your first psilocybin experience with committed practice. Do not rush this one.", cost: top.pricing[1]?.amount || "$500–$3,000" },
          { icon: Leaf, name: "Ayahuasca (Multi-night retreat)", time: "6–18 months in", why: "The vine rewards those who have built an integration foundation. After two or more psilocybin sessions, you are ready for deeper ancestral work.", cost: "$2,000–$6,000" },
          { icon: HeartHandshake, name: "MDMA (Trauma-focused)", time: "Parallel track — any time", why: "If trauma is underneath your healing goals, MDMA runs as a parallel track. It reaches places other medicines cannot.", cost: "$500–$8,000" },
        ]
      : overall >= 55
        ? [
            { icon: Wind, name: "Holotropic Breathwork", time: "Start now — no substances", why: "Build capacity to navigate altered states before medicine work. 3–6 sessions create the container and skills.", cost: "$100–$400" },
            { icon: Microscope, name: "Microdosing Protocol (30 days)", time: "Month 1–3", why: "Psilocybin microdosing with the Fadiman protocol and lion's mane stack builds neuroplasticity and helps you track your baseline safely.", cost: "$100–$300/mo" },
            { icon: Sparkles, name: "Psilocybin (Low dose, guided)", time: "Month 3–6", why: "Facilitated low-dose experience (1–2g) in trusted setting. Calibrates your nervous system for deeper work.", cost: "$400–$1,500" },
            { icon: top.icon, name: top.name + " (Full dose)", time: "Month 6–12", why: "Your optimal medicine once the foundation is established. Meaningful potential here with proper preparation and real integration support.", cost: top.pricing[1]?.amount || "$1,000–$4,000" },
          ]
        : [
            { icon: Bean, name: "Ceremonial Cacao + Intention", time: "Start immediately", why: "Build a heart relationship with plant medicines in the safest container available. This cultivates the receptivity that all deeper work requires.", cost: "$50–$200" },
            { icon: Wind, name: "Breathwork (Wim Hof / Holotropic)", time: "Month 1–3", why: "The most important preparation you can do is learning to ride altered states. Six or more sessions before any medicine work changes outcomes dramatically.", cost: "$50–$200" },
            { icon: Microscope, name: "Microdosing Psilocybin", time: "Month 2–4", why: "Sub-perceptual doses build your relationship with the medicine, improve your baseline, and prepare your nervous system. The best starting point in the whole spectrum.", cost: "$100–$300/mo" },
            { icon: Pill, name: "Ketamine-Assisted Therapy", time: "If acute need — any time", why: "The only currently legal psychedelic-adjacent therapy in the US. Rapid relief with professional oversight. If there is an acute need, this is where to start.", cost: "$400–$800/session" },
          ];

  return { dimScores, overall, level, topMatches: scored.slice(0, 6), sequence };
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
