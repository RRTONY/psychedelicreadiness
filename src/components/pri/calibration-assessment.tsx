"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BarChart3, RefreshCw, ShieldCheck, Target, Sparkles } from "lucide-react";
import { DIMS, DIM_LABELS, DIM_ICONS, type DimKey } from "@/lib/content/pri-data";
import efficacyData from "@/lib/content/pri-efficacy-data.json";

function DimIcon({ dim, className }: { dim: DimKey; className: string }) {
  const Icon = DIM_ICONS[dim];
  return <Icon aria-hidden="true" className={className} />;
}


function generatePairs(): [DimKey, DimKey][] {
  const pairs: [DimKey, DimKey][] = [];
  for (let i = 0; i < DIMS.length; i++) {
    for (let j = i + 1; j < DIMS.length; j++) {
      pairs.push([DIMS[i], DIMS[j]]);
    }
  }
  return pairs.sort(() => Math.random() - 0.5);
}

// Bradley-Terry model — same real math as legacy, unchanged.
function computeCalibratedScores(choices: { pair: [string, string]; chosen: string }[]): Record<DimKey, number> {
  const wins: Record<string, number> = {};
  const losses: Record<string, number> = {};
  DIMS.forEach((d) => {
    wins[d] = 0;
    losses[d] = 0;
  });

  for (const c of choices) {
    wins[c.chosen]++;
    const loser = c.pair[0] === c.chosen ? c.pair[1] : c.pair[0];
    losses[loser]++;
  }

  const strengths: Record<string, number> = {};
  let total = 0;
  DIMS.forEach((d) => {
    const s = (wins[d] + 1) / (wins[d] + losses[d] + 2);
    strengths[d] = s;
    total += s;
  });

  const scores: Record<string, number> = {};
  DIMS.forEach((d) => {
    scores[d] = Math.round(((strengths[d] / total) * 100 * DIMS.length) / 1.0);
  });

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore > 0) {
    DIMS.forEach((d) => {
      scores[d] = Math.round((scores[d] / maxScore) * 100);
    });
  }

  return scores as Record<DimKey, number>;
}

type Phase = "intro" | "pairwise" | "ranking" | "results";

// Ported from legacy client/src/pages/pri/PriCalibration.tsx — the real
// forced-rank psychometric calibration (all 15 pairwise dimension
// comparisons via Bradley-Terry scoring, then a full drag-or-arrow
// ranking), real methodology copy, and the real Monte Carlo validation
// metrics (`lib/content/pri-efficacy-data.json`, copied verbatim), all
// unchanged. Kept as one client island — a phase state machine drives the
// whole flow, same pattern as the other PRI assessments.
//
// The "Contribute to Research?" step (legacy's opt-in) is left out: this site keeps no database,
// so calibrations aren't saved anywhere (owner's choice, 2026-10-23). Legacy's live
// "Community Data" panel is not ported either.
export function CalibrationAssessment() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [pairIndex, setPairIndex] = useState(0);
  const [choices, setChoices] = useState<{ pair: [string, string]; chosen: string }[]>([]);
  const [rankings, setRankings] = useState<DimKey[]>([...DIMS]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const pairs = useMemo(() => generatePairs(), []);
  const calibratedScores = useMemo(() => computeCalibratedScores(choices), [choices]);

  const handlePairChoice = useCallback(
    (chosen: DimKey) => {
      const pair = pairs[pairIndex];
      setChoices((prev) => [...prev, { pair, chosen }]);
      if (pairIndex < pairs.length - 1) {
        setPairIndex((prev) => prev + 1);
      } else {
        setPhase("ranking");
      }
    },
    [pairIndex, pairs]
  );

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newRankings = [...rankings];
    const [dragged] = newRankings.splice(draggedIdx, 1);
    newRankings.splice(idx, 0, dragged);
    setRankings(newRankings);
    setDraggedIdx(idx);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  const moveItem = (idx: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= rankings.length) return;
    const newRankings = [...rankings];
    [newRankings[idx], newRankings[newIdx]] = [newRankings[newIdx], newRankings[idx]];
    setRankings(newRankings);
  };

  const reset = () => {
    setPhase("intro");
    setPairIndex(0);
    setChoices([]);
    setRankings([...DIMS]);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-pri-ink via-[#33200F] to-[#24142A] font-body text-pri-cream">
      <div className="mx-auto max-w-180 px-5 py-8">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 text-[.8rem] text-pri-cream/60 md:min-h-6">
            <ArrowLeft aria-hidden="true" className="size-3.5" /> Back to PRI
          </Link>
          <h1 className="my-3 font-heading text-[clamp(1.8rem,5vw,2.5rem)] font-black text-pri-cream">Deep Calibration</h1>
          <p className="mx-auto max-w-125 text-[.9rem] text-pri-cream/50">Forced-rank psychometric validation for your Readiness Profile</p>
        </div>

        {phase === "intro" && (
          <div className="text-center">
            <div className="mb-4 rounded-2xl border border-pri-cream/8 bg-pri-cream/4 p-6">
              <h2 className="mb-4 font-heading text-xl text-pri-cream">Why Calibrate?</h2>
              <p className="mb-5 text-[.88rem] leading-[1.7] text-pri-cream/60">
                Standard Likert scales (1–10 sliders) suffer from <strong className="text-pri-purple-light">acquiescence bias</strong> — people tend to rate
                everything high. Forced-rank calibration eliminates this by making you choose between dimensions, revealing your <em>true</em> readiness
                profile.
              </p>
              <div className="mb-6 grid grid-cols-2 gap-4 text-left">
                <div className="rounded-2xl border border-pri-cream/8 bg-pri-cream/4 p-4">
                  <BarChart3 className="mb-1 size-6 text-pri-purple-light" />
                  <div className="mb-1 text-[.78rem] font-bold">+26.9% Accuracy</div>
                  <div className="text-[.72rem] text-pri-cream/60">vs. standard Likert scoring</div>
                </div>
                <div className="rounded-2xl border border-pri-cream/8 bg-pri-cream/4 p-4">
                  <RefreshCw className="mb-1 size-6 text-pri-purple-light" />
                  <div className="mb-1 text-[.78rem] font-bold">0.609 Test-Retest</div>
                  <div className="text-[.72rem] text-pri-cream/60">Reliability coefficient</div>
                </div>
                <div className="rounded-2xl border border-pri-cream/8 bg-pri-cream/4 p-4">
                  <ShieldCheck className="mb-1 size-6 text-pri-purple-light" />
                  <div className="mb-1 text-[.78rem] font-bold">38% Less Fakeable</div>
                  <div className="text-[.72rem] text-pri-cream/60">Shift resistance vs. Likert</div>
                </div>
                <div className="rounded-2xl border border-pri-cream/8 bg-pri-cream/4 p-4">
                  <Target className="mb-1 size-6 text-pri-purple-light" />
                  <div className="mb-1 text-[.78rem] font-bold">Perfect Entropy</div>
                  <div className="text-[.72rem] text-pri-cream/60">1.0 normalized distribution</div>
                </div>
              </div>
              <p className="mb-6 text-[.8rem] text-pri-cream/60">Takes ~3 minutes. 15 forced choices + 1 full ranking.</p>
              <button onClick={() => setPhase("pairwise")} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pri-purple px-6 py-3 text-sm font-bold text-pri-cream">
                Begin Calibration
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
        )}

        {phase === "pairwise" && (
          <div>
            <div className="mb-6 h-1 overflow-hidden rounded-full bg-pri-cream/10">
              <div className="h-full bg-linear-to-r from-pri-purple to-pri-purple-light transition-[width] duration-300" style={{ width: `${((pairIndex + 1) / pairs.length) * 100}%` }} />
            </div>
            <div className="mb-4 text-center">
              <span className="text-xs tracking-[0.08em] text-pri-cream/60 uppercase">
                Comparison {pairIndex + 1} of {pairs.length}
              </span>
            </div>
            <div className="rounded-2xl border border-pri-cream/8 bg-pri-cream/4 p-6 text-center">
              <p className="mb-6 text-[.9rem] text-pri-cream/60">
                Which dimension are you <strong className="text-pri-purple-light">more ready</strong> in right now?
              </p>
              <div className="grid grid-cols-2 gap-4">
                {pairs[pairIndex].map((dim) => (
                  <button key={dim} onClick={() => handlePairChoice(dim)} className="rounded-2xl border-2 border-pri-purple/30 bg-pri-cream/4 p-6 text-center transition-all hover:scale-102 hover:border-pri-purple">
                    <DimIcon dim={dim} className="mx-auto mb-2 size-7 text-pri-purple-light" />
                    <div className="text-[.85rem] font-bold">{DIM_LABELS[dim]}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {phase === "ranking" && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="mb-2 font-heading text-xl text-pri-cream">Rank All Dimensions</h2>
              <p className="text-[.85rem] text-pri-cream/50">
                Drag to reorder from <strong className="text-pri-purple-light">most ready</strong> (top) to <strong className="text-pri-purple-light">least ready</strong> (bottom)
              </p>
            </div>
            <div className="mb-6">
              {rankings.map((dim, idx) => (
                <div
                  key={dim}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`mb-4 flex cursor-grab items-center gap-4 rounded-2xl border p-4 ${draggedIdx === idx ? "border-pri-purple opacity-50" : "border-pri-cream/8"}`}
                >
                  <div className="w-7 text-center text-xl font-black text-pri-purple">{idx + 1}</div>
                  <DimIcon dim={dim} className="size-6 shrink-0 text-pri-purple-light" />
                  <div className="flex-1 text-[.9rem] font-bold">{DIM_LABELS[dim]}</div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      aria-label={`Move ${DIM_LABELS[dim]} up`}
                      onClick={() => moveItem(idx, "up")}
                      disabled={idx === 0}
                      className={`text-base ${idx === 0 ? "text-pri-cream/15" : "text-pri-cream/50"}`}
                    >
                      <ArrowUp aria-hidden="true" className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${DIM_LABELS[dim]} down`}
                      onClick={() => moveItem(idx, "down")}
                      disabled={idx === rankings.length - 1}
                      className={`text-base ${idx === rankings.length - 1 ? "text-pri-cream/15" : "text-pri-cream/50"}`}
                    >
                      <ArrowDown aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setPhase("results")} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pri-purple px-6 py-3 text-sm font-bold text-pri-cream">
              Continue
              <ArrowRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}

        {phase === "results" && (
          <div>
            <div className="mb-8 text-center">
              <Sparkles className="mx-auto mb-2 size-9 text-pri-purple-light" />
              <h2 className="mb-2 font-heading text-2xl text-pri-cream">Calibrated Profile</h2>
              <p className="text-[.85rem] text-pri-cream/50">Your forced-rank readiness scores, corrected for acquiescence bias</p>
            </div>

            <div className="mb-4 rounded-2xl border border-pri-cream/8 bg-pri-cream/4 p-6">
              <h3 className="mb-4 font-heading text-base text-pri-cream">Your Calibrated Scores</h3>
              {rankings.map((dim, idx) => (
                <div key={dim} className="mb-3 flex items-center gap-3">
                  <div className="w-6 text-xs font-black text-pri-purple">#{idx + 1}</div>
                  <DimIcon dim={dim} className="size-5 shrink-0 text-pri-purple-light" />
                  <div className="flex-1">
                    <div className="mb-1 text-[.8rem] font-bold">{DIM_LABELS[dim]}</div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-pri-cream/8">
                      <div className="h-full rounded-full bg-linear-to-r from-pri-purple to-pri-purple-light transition-[width] duration-500" style={{ width: `${calibratedScores[dim]}%` }} />
                    </div>
                  </div>
                  <div className="w-9 text-right text-[.9rem] font-black text-pri-purple-light">{calibratedScores[dim]}</div>
                </div>
              ))}
            </div>

            <div className="mb-4 rounded-2xl border border-pri-cream/8 bg-pri-cream/4 p-6">
              <h3 className="mb-2 font-heading text-base text-pri-cream">Validation Metrics</h3>
              <p className="mb-4 text-[.78rem] text-pri-cream/60">Monte Carlo simulation: {efficacyData.simulation.n_respondents.toLocaleString("en-US")} synthetic respondents</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-xl font-black text-pri-purple-light">{efficacyData.classification_accuracy.forced_rank}%</div>
                  <div className="text-[.68rem] text-pri-cream/60">Classification Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-pri-purple-light">{efficacyData.test_retest_reliability.forced_rank}</div>
                  <div className="text-[.68rem] text-pri-cream/60">Test-Retest r</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-pri-purple-light">{efficacyData.entropy.forced_rank_normalized}</div>
                  <div className="text-[.68rem] text-pri-cream/60">Entropy (norm)</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link href="/" className="rounded-xl bg-pri-purple px-6 py-3 text-sm font-bold text-pri-cream">
                <span className="inline-flex items-center gap-1.5">
                  <ArrowLeft aria-hidden="true" className="size-[1em] shrink-0" />
                  Back to PRI
                </span>
              </Link>
              <button onClick={reset} className="rounded-xl border border-pri-cream/20 px-6 py-3 text-sm font-bold text-pri-cream">
                Retake Calibration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
