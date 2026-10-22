"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Brain, CheckCircle2, ChevronLeft, ChevronRight, DollarSign, GripVertical, Heart, Leaf, MapPin, Shield, Star, Users, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import {
  type CompassAnswers,
  type DimensionKey,
  DIMENSION_KEYS,
  DIMENSION_LABELS,
  scoreAllFacilities,
  getInitialRankOrder,
  type FacilityResult,
} from "@/lib/content/pri-iboga-compass-engine";

const CONTACT_EMAIL = "tony@tonygreenberg.com";

interface Question {
  id: string;
  text: string;
  subtext?: string;
  type: "single" | "multi";
  options: string[];
  warning?: string;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  questions: Question[];
}

const SECTIONS: Section[] = [
  {
    id: "outcome",
    title: "What You're Seeking",
    icon: <Heart className="size-5" />,
    questions: [
      {
        id: "Q1",
        text: "What is your primary reason for seeking iboga/ibogaine?",
        type: "single",
        options: [
          "Substance dependency (opioids, alcohol, stimulants, etc.)",
          "PTSD, trauma, or treatment-resistant depression",
          "Neurodegenerative condition (TBI, Parkinson's, etc.)",
          "Spiritual exploration or Bwiti initiation",
          "Cognitive optimization or personal growth",
          "Process addiction (gambling, sex, food, screens)",
        ],
      },
      {
        id: "Q2",
        text: "How urgent is your timeline?",
        subtext: "This affects which facilities can accommodate you.",
        type: "single",
        options: ["Within 30 days — I need help now", "1–3 months — planning ahead", "3–6 months — researching options", "No rush — finding the right fit matters most"],
      },
      {
        id: "Q3",
        text: "Which substances are you currently using or withdrawing from?",
        subtext: "Select all that apply. This directly routes you to specialized providers.",
        type: "multi",
        options: [
          "Opioids (heroin, fentanyl, oxy, morphine)",
          "Opioid replacement (Suboxone, methadone)",
          "Alcohol",
          "Cocaine / crack",
          "Methamphetamine",
          "Cannabis",
          "Nicotine",
          "Prescription stimulants (Adderall, Ritalin)",
          "Benzodiazepines (Xanax, Klonopin, Valium)",
          "Ketamine",
          "MDMA / ecstasy",
          "Polydrug (multiple substances daily)",
          "Process addiction (no substance)",
          "None — spiritual or optimization focus",
        ],
      },
    ],
  },
  {
    id: "medical",
    title: "Medical Safety",
    icon: <Shield className="size-5" />,
    questions: [
      {
        id: "Q4",
        text: "Do you have any personal cardiac history?",
        subtext: "Ibogaine affects the QT interval. Honest answers save lives.",
        type: "single",
        options: ["No known cardiac issues", "Minor — palpitations, mild murmur, managed hypertension", "Significant — arrhythmia, prolonged QT, prior cardiac event", "Unsure — have not had recent cardiac screening"],
        warning: "If you selected 'Significant,' only the highest-safety facilities will be shown. Consider a full cardiac workup before proceeding.",
      },
      {
        id: "Q5",
        text: "Any family history of sudden cardiac death or Long QT Syndrome?",
        type: "single",
        options: ["No family cardiac history", "Yes — first-degree relative (parent, sibling)", "Yes — sudden cardiac death in family", "Unsure"],
      },
      {
        id: "Q6",
        text: "Liver or kidney function?",
        subtext: "Ibogaine is metabolized by the liver (CYP2D6).",
        type: "single",
        options: ["Normal — no known issues", "Hepatitis C (active or cleared)", "Cirrhosis or significant liver damage", "Elevated enzymes or fatty liver", "Kidney concerns"],
      },
      {
        id: "Q7",
        text: "Mental health history?",
        type: "single",
        options: ["No significant mental health history", "Depression or anxiety (managed)", "Bipolar disorder", "Psychosis or schizophrenia history", "Complex PTSD or dissociative disorders"],
        warning: "Bipolar and psychosis history require specialized clinical oversight. Results will be filtered accordingly.",
      },
      {
        id: "Q8",
        text: "Current medications that interact with ibogaine?",
        subtext: "Many medications must be tapered before ibogaine. Select the most relevant.",
        type: "single",
        options: ["SSRIs or SNRIs", "Benzodiazepines", "Antipsychotics", "Methadone or Suboxone", "MAOIs", "None of the above"],
      },
      {
        id: "Q9",
        text: "Are you pregnant or breastfeeding?",
        type: "single",
        options: ["No", "Yes — pregnant", "Yes — breastfeeding"],
        warning: "Ibogaine is absolutely contraindicated during pregnancy and breastfeeding. No facility will be recommended.",
      },
    ],
  },
  {
    id: "approach",
    title: "Approach & Tradition",
    icon: <Leaf className="size-5" />,
    questions: [
      {
        id: "Q10",
        text: "Where do you fall on the medicine-ceremony spectrum?",
        type: "single",
        options: [
          "Full medical — hospital-grade monitoring, clinical setting",
          "Medical primary — clinical safety with some spiritual elements",
          "Balanced — equal weight to medical and ceremonial",
          "Ceremony primary — traditional setting with medical backup",
          "Pure Bwiti — traditional initiation, minimal Western medical overlay",
        ],
      },
      {
        id: "Q11",
        text: "How important is Bwiti lineage and cultural authenticity?",
        type: "single",
        options: ["Essential — I want trained Bwiti practitioners only", "Important — prefer lineage-trained facilitators", "Neutral — open to either approach", "Not important — clinical expertise matters more", "Prefer no ceremonial elements"],
      },
      {
        id: "Q12",
        text: "How important is Nagoya Protocol reciprocity to you?",
        subtext: "Does the provider give back to Gabonese communities and sustainable iboga stewardship?",
        type: "single",
        options: ["Very important — I want to support indigenous stewardship", "Somewhat important — a factor in my decision", "Neutral", "Not a deciding factor"],
      },
    ],
  },
  {
    id: "logistics",
    title: "Budget & Logistics",
    icon: <DollarSign className="size-5" />,
    questions: [
      {
        id: "Q13",
        text: "What is your total budget for treatment?",
        subtext: "Include travel, treatment, and aftercare.",
        type: "single",
        options: ["Under $5,000", "$5,000 – $10,000", "$10,000 – $20,000", "$20,000 – $50,000", "Open budget — best fit matters more than cost"],
      },
      {
        id: "Q14",
        text: "How long can you be away?",
        type: "single",
        options: ["Up to 5 days", "5–10 days", "2–3 weeks", "1–2 months", "As long as it takes"],
      },
    ],
  },
  {
    id: "geography",
    title: "Location & Access",
    icon: <MapPin className="size-5" />,
    questions: [
      {
        id: "Q16",
        text: "How far are you willing to travel?",
        type: "single",
        options: ["Anywhere in the world", "Western hemisphere + Europe", "North America only (Mexico, USA, Bahamas)", "Drive distance from US border only"],
      },
      {
        id: "Q17",
        text: "Language requirements?",
        type: "single",
        options: ["English only", "English preferred, some Spanish OK", "Bilingual English/Spanish", "French or Portuguese acceptable", "Language is not a barrier"],
      },
    ],
  },
  {
    id: "personal",
    title: "Personal Factors",
    icon: <Users className="size-5" />,
    questions: [
      {
        id: "Q19",
        text: "Are you a military veteran or first responder?",
        type: "single",
        options: ["Yes — active duty or veteran", "Yes — first responder (fire, EMS, police)", "No"],
      },
      {
        id: "Q21",
        text: "How important is privacy and discretion?",
        type: "single",
        options: ["Critical — I'm a public figure or professional", "Very important — I don't want anyone to know", "Somewhat important", "Not a concern"],
      },
      {
        id: "Q23",
        text: "Facility expectations?",
        type: "single",
        options: ["Luxury — private suite, gourmet food, spa amenities", "Comfortable — clean, private room, good food", "Simple — basic but clean and safe", "Rustic — I'm here for the medicine, not the hotel"],
      },
      {
        id: "Q24",
        text: "Dietary requirements?",
        type: "single",
        options: ["Strict vegan", "Vegetarian", "No restrictions", "Other (will discuss with facility)"],
      },
      {
        id: "Q25",
        text: "Will family or a partner accompany you?",
        type: "single",
        options: ["Yes — I need a family program", "Maybe — it would be nice", "No — solo journey"],
      },
    ],
  },
  {
    id: "aftercare",
    title: "Integration & Aftercare",
    icon: <Brain className="size-5" />,
    questions: [
      {
        id: "Q26",
        text: "How much aftercare support do you want?",
        type: "single",
        options: ["Lifetime — ongoing community and check-ins", "6+ months of structured integration", "3 months of follow-up", "Minimal — I have my own support system"],
      },
      {
        id: "Q27",
        text: "Risk tolerance?",
        subtext: "Some facilities prioritize safety above all; others offer deeper but less medically supervised experiences.",
        type: "single",
        options: ["Lowest risk possible — maximum medical oversight", "Balanced — reasonable safety with meaningful depth", "Higher risk acceptable — depth and authenticity over medical infrastructure"],
      },
      {
        id: "Q28",
        text: "What matters most in your decision?",
        subtext: "This helps calibrate the final ranking.",
        type: "single",
        options: ["Track record — proven results with people like me", "Safety — the most medically rigorous option", "Authenticity — real Bwiti tradition and indigenous connection", "Value — best outcome for my budget", "Speed — fastest intake and treatment", "Comfort — the best physical experience"],
      },
    ],
  },
];

const QUESTION_TEXTS: Record<string, string> = {
  Q1: "Primary reason",
  Q2: "Timeline",
  Q3: "Substances",
  Q4: "Cardiac history",
  Q5: "Family cardiac history",
  Q6: "Liver/kidney",
  Q7: "Mental health",
  Q8: "Medications",
  Q9: "Pregnant/breastfeeding",
  Q10: "Medicine-ceremony spectrum",
  Q11: "Bwiti lineage importance",
  Q12: "Nagoya reciprocity",
  Q13: "Budget",
  Q14: "Time away",
  Q16: "Travel distance",
  Q17: "Language",
  Q19: "Veteran/first responder",
  Q21: "Privacy importance",
  Q23: "Facility expectations",
  Q24: "Dietary requirements",
  Q25: "Family accompanying",
  Q26: "Aftercare support",
  Q27: "Risk tolerance",
  Q28: "Decision priority",
};
const Q1_OPTIONS = ["Substance dependency", "PTSD/trauma/depression", "Neurodegenerative", "Spiritual/Bwiti", "Cognitive optimization", "Process addiction"];
const Q13_OPTIONS = ["Under $5,000", "$5,000–$10,000", "$10,000–$20,000", "$20,000–$50,000", "Open budget"];
const RANK_MULTIPLIERS = [2.0, 1.7, 1.4, 1.2, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5];

type Phase = "questions" | "rank" | "gate" | "results";

// Ported from legacy client/src/pages/pri/IbogaCompassAssessment.tsx — the
// real 28-question, 7-section compass (outcome/medical/approach/logistics/
// geography/personal/aftercare), the real drag-or-arrow priority-rank step,
// the real facility-scoring engine (`pri-iboga-compass-engine.ts`, copied
// verbatim), and the real results view (matched facilities with real
// "why this matched" reasoning, real eliminated-facility reasons, real
// disclaimer), all ported unchanged and verbatim. Uses this site's
// `brand-gold`/`foreground`/`muted-foreground` tokens rather than the
// `pri-*` palette used by the rest of the PRI deep-dive modules — legacy's
// own hex here (`#836311`) is an exact match for `brand-gold`, i.e. this
// one page always used the main site's identity, not a PRI-specific one.
//
// Legacy's lead-capture gate posted to `trpc.assessments.submit` (no
// backend built for this migration) with a rich structured payload
// (question-by-question answers, top facility matches, primary goal,
// budget range). Replaced with a `mailto:` to Tony carrying the same
// structured summary — honest-degradation pattern used throughout this
// migration — rather than reproducing a submit call with nothing behind
// it. The "Submitting..." pending state and its error-toast path (both
// meaningless once there's no network call) are dropped along with it.
export function IbogaCompassAssessment() {
  const [phase, setPhase] = useState<Phase>("questions");
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<CompassAnswers>({});
  const [rankOrder, setRankOrder] = useState<DimensionKey[]>([...DIMENSION_KEYS]);
  const [results, setResults] = useState<FacilityResult[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const totalQuestions = useMemo(() => SECTIONS.reduce((acc, s) => acc + s.questions.length, 0), []);
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress = Math.round((answeredCount / totalQuestions) * 100);
  const section = SECTIONS[currentSection];

  const handleSingleAnswer = useCallback((questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  }, []);

  const handleMultiAnswer = useCallback((questionId: string, optionIdx: number) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as number[]) || [];
      const next = current.includes(optionIdx) ? current.filter((i) => i !== optionIdx) : [...current, optionIdx];
      return { ...prev, [questionId]: next };
    });
  }, []);

  const goNext = () => {
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection((s) => s + 1);
    } else {
      setRankOrder(getInitialRankOrder(answers));
      setPhase("rank");
    }
  };
  const goPrev = () => {
    if (currentSection > 0) setCurrentSection((s) => s - 1);
  };

  const computeResults = () => {
    setResults(scoreAllFacilities(answers, rankOrder));
    setPhase("gate");
  };

  const resetAssessment = () => {
    setPhase("questions");
    setCurrentSection(0);
    setAnswers({});
    setRankOrder([...DIMENSION_KEYS]);
    setResults([]);
  };

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newOrder = [...rankOrder];
    const [removed] = newOrder.splice(draggedIdx, 1);
    newOrder.splice(idx, 0, removed);
    setRankOrder(newOrder);
    setDraggedIdx(idx);
  };
  const handleDragEnd = () => setDraggedIdx(null);
  const moveRankItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= DIMENSION_KEYS.length) return;
    const newOrder = [...rankOrder];
    const [removed] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, removed);
    setRankOrder(newOrder);
  };

  const [gateName, setGateName] = useState("");
  const [gateEmail, setGateEmail] = useState("");
  const [gateSituation, setGateSituation] = useState("");
  const [gateConsent, setGateConsent] = useState(false);
  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generated here rather than via a `useRef(Date.now() + ...)`
    // initializer — `Date.now`/`Math.random` are impure, and this id is
    // only ever read inside this one submit handler, not during render, so
    // there's no need to stash it in a ref at all.
    const sessionId = `iboga-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    if (!gateName.trim() || !gateEmail.trim() || !gateSituation.trim() || !gateConsent) return;

    const answersArr = Object.entries(answers).map(([qId, val]) => ({
      questionId: QUESTION_TEXTS[qId] || qId,
      answer: Array.isArray(val) ? val.map(String).join(", ") : String(val),
    }));
    const eligible = results.filter((r) => !r.eliminated);
    const top3 = eligible.slice(0, 3).map((r) => `${r.facility.name} (${r.matchPercent}% match) — ${r.whyMatched}`);
    const primaryGoalIdx = typeof answers["Q1"] === "number" ? (answers["Q1"] as number) : -1;
    const budgetIdx = typeof answers["Q13"] === "number" ? (answers["Q13"] as number) : -1;

    const bodyLines = [
      `Name: ${gateName.trim()}`,
      `Email: ${gateEmail.trim()}`,
      `Situation: ${gateSituation.trim()}`,
      "",
      `Primary goal: ${primaryGoalIdx >= 0 ? Q1_OPTIONS[primaryGoalIdx] : "Unknown"}`,
      `Budget range: ${budgetIdx >= 0 ? Q13_OPTIONS[budgetIdx] : "Unknown"}`,
      `Eligible facilities: ${eligible.length}`,
      "",
      "Top matches:",
      ...top3.map((t) => `- ${t}`),
      "",
      "Full answers:",
      ...answersArr.map((a) => `- ${a.questionId}: ${a.answer}`),
      "",
      `Session: ${sessionId}`,
    ];
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Iboga Compass — Facility Introduction Request")}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    setPhase("results");
  };

  if (phase === "results") {
    return <ResultsView results={results} onReset={resetAssessment} />;
  }

  if (phase === "gate") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-secondary">
            <CheckCircle2 className="size-8 text-brand-gold" />
          </div>
          <h1 className="mb-3 font-heading text-2xl text-foreground md:text-3xl">Your matches are ready.</h1>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-muted-foreground">
            Before I show you which facilities match your profile — and why — I want to be direct about how this works.
          </p>
        </div>

        <Card className="mb-6 border-brand-gold/20 bg-secondary/40 p-6">
          <p className="mb-4 text-base leading-relaxed text-foreground/80">
            I review every submission personally. I&apos;ve sat with this medicine. I know these facilities. When I send an introduction, it means I
            believe it&apos;s the right match for your situation. No cold leads. No automated referrals. A human connection from someone who has done the
            work.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your assessment profile — goals, medical flags, timeline, budget, values — travels with your submission so I have context before I reach out.
          </p>
        </Card>

        <form onSubmit={handleGateSubmit} className="space-y-5">
          <div>
            <label htmlFor="gate-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="gate-name"
              type="text"
              required
              value={gateName}
              onChange={(e) => setGateName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>
          <div>
            <label htmlFor="gate-email" className="mb-1.5 block text-sm font-medium text-foreground">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="gate-email"
              type="email"
              required
              value={gateEmail}
              onChange={(e) => setGateEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>
          <div>
            <label htmlFor="gate-situation" className="mb-1.5 block text-sm font-medium text-foreground">
              In one sentence, what are you seeking? <span className="text-red-500">*</span>
            </label>
            <input
              id="gate-situation"
              type="text"
              required
              maxLength={200}
              value={gateSituation}
              onChange={(e) => setGateSituation(e.target.value)}
              placeholder="e.g. I'm a veteran with treatment-resistant PTSD looking for a real path forward."
              className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-gold"
            />
            <p className="mt-1 text-xs text-muted-foreground">{gateSituation.length}/200</p>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-secondary p-4">
            <input type="checkbox" id="gate-consent" required checked={gateConsent} onChange={(e) => setGateConsent(e.target.checked)} className="mt-0.5 size-4 cursor-pointer rounded accent-brand-gold" />
            <label htmlFor="gate-consent" className="cursor-pointer text-sm leading-relaxed text-foreground">
              I consent to Tony Greenberg reviewing my assessment and making an introduction to relevant facilities.
            </label>
          </div>

          <Button type="submit" disabled={!gateName.trim() || !gateEmail.trim() || !gateSituation.trim() || !gateConsent} className="w-full bg-brand-gold py-4 text-base font-semibold text-white hover:bg-brand-gold/90">
            <span className="inline-flex items-center gap-1.5">
              Show My Matches
              <ArrowRight aria-hidden="true" className="size-[1em] shrink-0" />
            </span>
          </Button>

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Your information is not shared with any facility until Tony reviews your submission and makes a personal introduction. You will receive your
            matches immediately after submitting.
          </p>
        </form>
      </div>
    );
  }

  if (phase === "rank") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-3 font-heading text-2xl text-foreground md:text-3xl">Priority Rank</h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Drag to reorder what matters most to you. The top dimension gets 2x weight; the bottom gets 0.5x. This is the final calibration before your
            results.
          </p>
        </div>

        <div className="mb-8 space-y-2">
          {rankOrder.map((key, idx) => (
            <div
              key={key}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`flex cursor-grab items-center gap-3 rounded-lg border p-3 transition-all active:cursor-grabbing ${draggedIdx === idx ? "border-brand-gold bg-secondary shadow-md" : "border-border bg-background hover:border-foreground/20"}`}
            >
              <GripVertical className="size-4 shrink-0 text-muted-foreground" />
              <span className="w-6 shrink-0 text-center font-mono text-sm text-brand-gold">{idx + 1}</span>
              <span className="flex-1 text-sm font-medium text-foreground">{DIMENSION_LABELS[key]}</span>
              <span className="font-mono text-xs text-muted-foreground">{(RANK_MULTIPLIERS[idx] ?? 0.5).toFixed(1)}x</span>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveRankItem(idx, idx - 1)} disabled={idx === 0} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20" aria-label={`Move ${DIMENSION_LABELS[key]} up`}>
                  <ChevronUp aria-hidden="true" className="size-3.5" />
                </button>
                <button onClick={() => moveRankItem(idx, idx + 1)} disabled={idx === DIMENSION_KEYS.length - 1} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20" aria-label={`Move ${DIMENSION_LABELS[key]} down`}>
                  <ChevronDown aria-hidden="true" className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setPhase("questions");
              setCurrentSection(SECTIONS.length - 1);
            }}
            className="flex-1"
          >
            <ChevronLeft className="mr-1 size-4" /> Back to Questions
          </Button>
          <Button onClick={computeResults} className="flex-1 bg-brand-gold text-white hover:bg-brand-gold/90">
            Show My Matches <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Section {currentSection + 1} of {SECTIONS.length}
          </span>
          <span className="font-mono text-xs text-muted-foreground">{progress}% complete</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-brand-gold transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-brand-gold">{section.icon}</div>
        <h1 className="font-heading text-xl text-foreground md:text-2xl">{section.title}</h1>
      </div>

      <div className="space-y-8">
        {section.questions.map((q) => (
          <QuestionCard key={q.id} question={q} answer={answers[q.id]} onSingleAnswer={handleSingleAnswer} onMultiAnswer={handleMultiAnswer} />
        ))}
      </div>

      <div className="mt-10 flex gap-3 border-t border-border pt-6">
        <Button variant="outline" onClick={goPrev} disabled={currentSection === 0} className="flex-1">
          <ChevronLeft className="mr-1 size-4" /> Previous
        </Button>
        <Button onClick={goNext} className="flex-1 bg-brand-gold text-white hover:bg-brand-gold/90">
          {currentSection === SECTIONS.length - 1 ? "Rank Priorities" : "Next"} <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  answer,
  onSingleAnswer,
  onMultiAnswer,
}: {
  question: Question;
  answer: number | number[] | undefined;
  onSingleAnswer: (qId: string, idx: number) => void;
  onMultiAnswer: (qId: string, idx: number) => void;
}) {
  const selectedSingle = typeof answer === "number" ? answer : -1;
  const selectedMulti = Array.isArray(answer) ? answer : [];

  const showWarning =
    question.warning &&
    ((question.id === "Q4" && selectedSingle === 2) || (question.id === "Q7" && (selectedSingle === 2 || selectedSingle === 3)) || (question.id === "Q9" && (selectedSingle === 1 || selectedSingle === 2)));

  return (
    <div>
      <p className="mb-1 text-base font-medium text-foreground">{question.text}</p>
      {question.subtext && <p className="mb-3 text-sm text-muted-foreground">{question.subtext}</p>}

      <div className="space-y-2">
        {question.options.map((opt, idx) => {
          const isSelected = question.type === "single" ? selectedSingle === idx : selectedMulti.includes(idx);
          return (
            <button
              key={opt}
              onClick={() => (question.type === "single" ? onSingleAnswer(question.id, idx) : onMultiAnswer(question.id, idx))}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all ${isSelected ? "border-brand-gold bg-secondary text-foreground" : "border-border bg-background text-foreground/80 hover:border-foreground/20 hover:bg-secondary/50"}`}
            >
              <span className="flex items-center gap-3">
                <span className={`flex size-4 shrink-0 items-center justify-center border-2 ${question.type === "single" ? "rounded-full" : "rounded-sm"} ${isSelected ? "border-brand-gold" : "border-border"}`}>
                  {isSelected && <span className={`size-2 bg-brand-gold ${question.type === "single" ? "rounded-full" : "rounded-sm"}`} />}
                </span>
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {showWarning && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-xs text-red-700 dark:text-red-300">{question.warning}</p>
        </div>
      )}
    </div>
  );
}

function ResultsView({ results, onReset }: { results: FacilityResult[]; onReset: () => void }) {
  const eligible = results.filter((r) => !r.eliminated);
  const eliminated = results.filter((r) => r.eliminated);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10">
        <h1 className="mb-3 font-heading text-2xl text-foreground md:text-3xl">Your Compass Results</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          {eligible.length} facilities matched your profile. {eliminated.length > 0 && `${eliminated.length} were filtered out by your medical or logistical requirements.`}
        </p>
      </div>

      {eligible.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 size-12 text-amber-500" />
          <h3 className="mb-2 text-lg font-medium">No Facilities Match</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Your medical profile or filters eliminated all options. This may indicate ibogaine is contraindicated for you, or your requirements are too
            restrictive.
          </p>
          <Button onClick={onReset} variant="outline">
            Retake Assessment
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {eligible.slice(0, 5).map((result, idx) => (
            <FacilityCard key={result.facility.id} result={result} rank={idx + 1} />
          ))}
        </div>
      )}

      {eliminated.length > 0 && (
        <div className="mt-12">
          <h3 className="mb-4 font-mono text-sm tracking-wider text-muted-foreground uppercase">Filtered Out ({eliminated.length})</h3>
          <div className="space-y-3">
            {eliminated.slice(0, 5).map((result) => (
              <div key={result.facility.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground line-through">{result.facility.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{result.facility.location}</span>
                </div>
                <span className="text-xs text-red-500">{result.eliminationReason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 rounded-lg border border-border bg-secondary/40 p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <strong>Disclaimer:</strong> The Iboga Compass is an informational tool, not medical advice. Scores are based on publicly available information
          and the Compass v2 methodology. Always conduct your own due diligence, verify facility credentials, and consult with a physician before
          undergoing ibogaine treatment. Facility scores may change as new information becomes available.
        </p>
      </div>

      <div className="mt-8 text-center">
        <Button onClick={onReset} variant="outline">
          Retake Assessment
        </Button>
      </div>
    </div>
  );
}

function FacilityCard({ result, rank }: { result: FacilityResult; rank: number }) {
  const { facility, matchPercent, topDimensions, whyMatched } = result;
  const medalClass: Record<number, string> = { 1: "bg-[#D4B96A]", 2: "bg-[#A0A0A0]", 3: "bg-[#CD7F32]" };

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-full text-sm font-bold text-white ${medalClass[rank] ?? "bg-muted-foreground"}`}>#{rank}</div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{facility.name}</h3>
              <p className="text-sm text-muted-foreground">{facility.location}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-brand-gold">{matchPercent}%</div>
            <div className="text-xs text-muted-foreground">match</div>
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground italic">{facility.tagline}</p>

        <div className="mb-4 rounded-lg border border-brand-gold/20 bg-secondary/60 p-3">
          <div className="mb-1 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-brand-gold" />
            <span className="text-xs font-medium tracking-wider text-brand-gold uppercase">Why This Matched</span>
          </div>
          <p className="text-sm text-foreground/85">{whyMatched}</p>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {topDimensions.map((dim) => (
            <div key={dim.key} className="rounded bg-secondary p-2 text-center">
              <div className="mb-1 text-xs text-muted-foreground">{dim.label}</div>
              <div className="text-sm font-bold text-foreground">{facility[dim.key as keyof typeof facility] as number}/10</div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">{facility.priceRange}</span>
          <span className="rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">
            {facility.durationDays[0]}–{facility.durationDays[1]} days
          </span>
          <span className="rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground capitalize">{facility.approach}</span>
          {facility.veteranFocus && <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-950/40 dark:text-green-400">Veteran Focus</span>}
        </div>

        <ul className="space-y-1">
          {facility.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Star className="mt-0.5 size-3 shrink-0 text-amber-500" />
              {h}
            </li>
          ))}
        </ul>

        <div className="mt-4 border-t border-border pt-4">
          <a href={facility.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-gold hover:underline">
            <span className="inline-flex items-center gap-1.5">
              Visit {facility.shortName}
              <ArrowRight aria-hidden="true" className="size-[1em] shrink-0" />
            </span>
          </a>
        </div>
      </div>
    </Card>
  );
}
