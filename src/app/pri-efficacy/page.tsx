import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import simData from "@/lib/content/pri-efficacy-data.json";

// Ported from legacy client/src/pages/pri/PriEfficacy.tsx — the real Monte
// Carlo simulation results (10,000 synthetic respondents), real
// classification-accuracy comparison, real dimension-priority distribution
// (the real first-dimension-inflation finding), real test-retest
// reliability and entropy metrics, and the real methodology writeup, all
// unchanged and verbatim, reading from the same `pri-efficacy-data.json`
// also used by `/pri-calibration`.
//
// Legacy's "Live Calibrations" tab is left out: this site keeps no database, so there are no
// live numbers to show (owner's choice, 2026-10-23). The simulation results are the whole page.
export const metadata: Metadata = {
  title: "PRI Efficacy — Research and Evidence",
  description: "The Monte Carlo simulation research and psychometric evidence base behind the Psychedelic Readiness Index.",
  alternates: { canonical: "/pri-efficacy" },
};

const DIM_LABELS: Record<string, string> = {
  Medical: "Medical Readiness",
  Pharmacological: "Pharmacological Knowledge",
  Psychological: "Psychological Stability",
  Intention: "Intentionality & Purpose",
  Setting: "Set & Setting Preparation",
  Integration: "Integration Capacity",
};

const DIM_COLORS: Record<string, string> = {
  Medical: "#EF4444",
  Pharmacological: "#F59E0B",
  Psychological: "#10B981",
  Intention: "#818CF8",
  Setting: "#A78BFA",
  Integration: "#EC4899",
};

function BarChart({ label, value, max, color, suffix }: { label: string; value: number; max: number; color: string; suffix?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-[.85rem]">
        <span className="text-pri-cream">{label}</span>
        <span className="font-bold" style={{ color }}>
          {typeof value === "number" ? value.toFixed(1) : value}
          {suffix || ""}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-pri-cream/10">
        <div className="h-full rounded transition-[width] duration-600" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }: { title: string; value: string | number; subtitle?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-pri-purple/25 bg-pri-purple/8 p-5 text-center">
      <div className="mb-2 text-xs tracking-[0.08em] text-pri-cream/50 uppercase">{title}</div>
      <div className="text-[1.8rem] font-extrabold" style={{ color: color || "#A855F7" }}>
        {value}
      </div>
      {subtitle && <div className="mt-1 text-xs text-pri-cream/60">{subtitle}</div>}
    </div>
  );
}

export default function PriEfficacyPage() {
  const dims = Object.keys(DIM_LABELS);
  const { classification_accuracy, entropy, test_retest_reliability, role_distribution, first_role_inflation, simulation } = simData;

  return (
    <div className="min-h-screen bg-pri-ink font-body text-pri-cream">
      <header className="mx-auto max-w-225 px-6 pt-12 pb-8 text-center">
        <div className="mb-2 text-xs tracking-[0.15em] text-pri-purple-light uppercase">Psychometric Validation</div>
        <h1 className="font-heading text-[clamp(1.8rem,5vw,2.8rem)] leading-[1.2] font-bold text-pri-cream">PRI Efficacy Report</h1>
        <p className="mx-auto mt-3 max-w-150 text-[.95rem] text-pri-cream/50">
          Monte Carlo simulation with {simulation.n_respondents.toLocaleString("en-US")} synthetic respondents validates the Psychedelic Readiness Index across
          six dimensions of preparedness.
        </p>
      </header>

      <div className="mx-auto max-w-225 px-6 pb-16 text-base">
        <div className="mb-10 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
          <StatCard title="Classification Accuracy" value={`${classification_accuracy.forced_rank}%`} subtitle="forced-rank method" color="#10B981" />
          <StatCard title="Test-Retest Reliability" value={test_retest_reliability.forced_rank.toFixed(2)} subtitle="forced-rank r-value" />
          <StatCard title="Entropy (Normalized)" value={entropy.forced_rank_normalized.toFixed(2)} subtitle="distribution uniformity" />
          <StatCard title="Improvement" value={`+${classification_accuracy.improvement}%`} subtitle="vs. Likert alone" color="#F59E0B" />
        </div>

        <div className="mb-8 rounded-xl border border-pri-cream/8 bg-pri-cream/3 p-6">
          <h2 className="mb-5 font-heading text-xl text-pri-cream">Classification Accuracy: Likert vs. Forced-Rank</h2>
          <p className="mb-4 text-[.8rem] text-pri-cream/60">
            Forced-rank calibration nearly doubles classification accuracy by eliminating acquiescence bias and social desirability effects.
          </p>
          <BarChart label="Likert Self-Report" value={classification_accuracy.likert} max={100} color="#EF4444" suffix="%" />
          <BarChart label="Forced-Rank Calibrated" value={classification_accuracy.forced_rank} max={100} color="#10B981" suffix="%" />
        </div>

        <div className="mb-8 rounded-xl border border-pri-cream/8 bg-pri-cream/3 p-6">
          <h2 className="mb-5 font-heading text-xl text-pri-cream">Dimension Priority Distribution</h2>
          <p className="mb-4 text-[.8rem] text-pri-cream/60">
            Likert scoring inflates &ldquo;{first_role_inflation.role}&rdquo; by {first_role_inflation.inflation_pct}%. Forced-rank produces near-uniform
            distribution.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-3 text-xs tracking-[0.08em] text-pri-cream/60 uppercase">Likert (biased)</div>
              {dims.map((d) => (
                <BarChart key={d} label={d} value={(role_distribution.likert as Record<string, number>)[d] / 100} max={((simulation.n_respondents / 100 / 6) * 2)} color={DIM_COLORS[d]} />
              ))}
            </div>
            <div>
              <div className="mb-3 text-xs tracking-[0.08em] text-pri-cream/60 uppercase">Forced-Rank (calibrated)</div>
              {dims.map((d) => (
                <BarChart key={d} label={d} value={(role_distribution.forced_rank as Record<string, number>)[d] / 100} max={((simulation.n_respondents / 100 / 6) * 2)} color={DIM_COLORS[d]} />
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-pri-cream/8 bg-pri-cream/3 p-6">
            <h2 className="mb-4 font-heading text-lg text-pri-cream">Test-Retest Reliability</h2>
            <BarChart label="Likert" value={test_retest_reliability.likert} max={1} color="#EF4444" />
            <BarChart label="Forced-Rank" value={test_retest_reliability.forced_rank} max={1} color="#10B981" />
            <p className="mt-2 text-xs text-pri-cream/60">Correlation between first and second administration (n={simulation.n_retest.toLocaleString("en-US")} retested)</p>
          </div>
          <div className="rounded-xl border border-pri-cream/8 bg-pri-cream/3 p-6">
            <h2 className="mb-4 font-heading text-lg text-pri-cream">Distribution Entropy</h2>
            <BarChart label="Likert" value={entropy.likert} max={entropy.max_possible} color="#F59E0B" />
            <BarChart label="Forced-Rank" value={entropy.forced_rank} max={entropy.max_possible} color="#10B981" />
            <p className="mt-2 text-xs text-pri-cream/60">Higher entropy = more uniform distribution across dimensions (max: {entropy.max_possible})</p>
          </div>
        </div>

        <div className="rounded-xl border border-pri-cream/8 bg-pri-cream/3 p-6">
          <h2 className="mb-4 font-heading text-xl text-pri-cream">Methodology</h2>
          <div className="space-y-3 text-[.85rem] leading-[1.7] text-pri-cream/60">
            <p>
              The PRI validation uses a Monte Carlo simulation with {simulation.n_respondents.toLocaleString("en-US")} synthetic respondents across{" "}
              {simulation.roles.length} readiness dimensions. Each respondent&apos;s answers are generated using dimension-specific trait distributions
              that model real-world response patterns including acquiescence bias and social desirability effects.
            </p>
            <p>Key validation metrics:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Classification Accuracy:</strong> Percentage of respondents correctly assigned to their true primary readiness dimension.
              </li>
              <li>
                <strong>Test-Retest Reliability:</strong> Stability of rankings across repeated administrations (n={simulation.n_retest.toLocaleString("en-US")}).
              </li>
              <li>
                <strong>Faking Resistance:</strong> Tested with {simulation.n_faking.toLocaleString("en-US")} simulated fakers attempting to inflate scores.
              </li>
              <li>
                <strong>Distribution Entropy:</strong> Measures how uniformly respondents are classified across dimensions (max = log2(
                {simulation.roles.length}) = {entropy.max_possible}).
              </li>
            </ul>
            <p>
              The forced-rank calibration module eliminates first-dimension inflation bias ({first_role_inflation.likert_pct}% →{" "}
              {first_role_inflation.forced_rank_pct}%) by requiring explicit trade-off comparisons between dimensions.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-8 pb-16 text-center">
        <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 text-[.9rem] text-pri-purple-light">
          <ArrowLeft aria-hidden="true" className="size-3.5" /> Take the PRI Assessment
        </Link>
        <span className="mx-4 text-pri-cream/20">|</span>
        <Link href="/pri-calibration" className="inline-flex min-h-11 items-center gap-1.5 text-[.9rem] text-pri-purple-light">
          Deep Calibration <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
