import type { Metadata } from "next";
import { SITE_OPEN_GRAPH } from "@/lib/site-open-graph";
import Link from "next/link";
import { MEDICINES } from "@/lib/content/pri-data";
import { MedicineSequencingLadder } from "@/components/pri/medicine-sequencing-ladder";

// Ported from legacy client/src/pages/MedicineSequencing.tsx — "The Medicine
// Sequencing Ladder." Renders from the same `MEDICINES` dataset as
// /psychedelic-readiness-index (already ported to `lib/content/pri-data.ts`).
// Legacy's inline `styles` object is rebuilt as Tailwind classes. Real legacy
// bug fixed: Mambe's `complexityLevel` was "Gentle Entry" — not one of the six
// rungs — so legacy counted it in "All (39)" but never rendered its card;
// normalized to "Entry" in the dataset. The hero's hardcoded "38 medicines"
// now reads the real dataset count.
export const metadata: Metadata = {
  title: "Medicine Sequencing Overview — Psychedelic Readiness Index",
  description:
    "An educational comparison of medicines by intensity and context. It is not a universal sequence or a recommendation about what to take.",
  alternates: { canonical: "/medicine-sequencing" },
  openGraph: { ...SITE_OPEN_GRAPH, url: "/medicine-sequencing" },
};

const SEQUENCING_PHILOSOPHY = [
  "This ladder is one educational framework for comparing medicines by intensity and context. It is not a universal sequence, and traditions do not all share the same progression. A lower-intensity option does not guarantee readiness for a higher-intensity one; health history, setting, support, and individual circumstances matter.",
  "This is not a recommendation engine. It groups experiences to help explain differences in intensity and context. It cannot determine what is appropriate for you or tell you what to take.",
  "Some people may decide that none of these options is right for them now. That is a valid outcome.",
];

export default function MedicineSequencingPage() {
  return (
    <div className="min-h-screen bg-linear-160 from-[#FAFAF7] via-[#FEF3C7] via-30% to-[#F0FDF4] font-sans text-facilitator-ink">
      <div className="mx-auto max-w-225 px-4 pt-10 pb-8 sm:px-12 sm:pt-20 sm:pb-12">
        <p className="mb-4 font-mono text-xs tracking-[0.15em] text-facilitator-amber-deep uppercase">
          The Spectrum · Know Before You Go
        </p>
        <h1 className="mb-5 font-heading text-4xl leading-tight font-bold text-facilitator-ink sm:text-5xl lg:text-6xl">
          The Medicine Sequencing Ladder
        </h1>
        <p className="mb-8 max-w-175 text-base leading-relaxed text-[#4A3728] sm:text-lg">
          {MEDICINES.length} medicines. Six rungs. One principle: don&apos;t skip the ladder. This is not a
          recommendation. It is an educational map, not a universal sequence.
        </p>

        <div className="mb-10 rounded-xl border border-l-4 border-facilitator-amber-deep/20 border-l-facilitator-amber-deep bg-white/70 p-4 backdrop-blur-sm sm:p-7">
          {SEQUENCING_PHILOSOPHY.map((para) => (
            <p key={para.slice(0, 24)} className="mb-4 text-sm leading-loose text-[#3D2B1F] last:mb-0 sm:text-base">
              {para}
            </p>
          ))}
        </div>
      </div>

      <MedicineSequencingLadder />

      <div className="mx-auto max-w-175 px-4 pt-8 pb-12 text-center sm:px-12">
        <p className="mb-6 text-sm leading-relaxed text-[#7A6050] sm:text-base">
          Ready to find out where you sit on this ladder? The Psychedelic Readiness Index assesses your readiness
          across six dimensions and tells you which medicines match your current profile.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-linear-to-br from-facilitator-amber-deep to-[#D97706] px-8 py-3.5 font-bold text-white transition-opacity hover:opacity-90"
        >
          Take the Readiness Index
        </Link>
        <p className="mt-6 text-sm text-[#7A6050]">
          Or read <Link href="https://tonygreenberg.com/the-philosophy" className="underline underline-offset-2 hover:text-facilitator-amber-deep">the philosophy</Link>{" "}
          behind every instrument, or see the{" "}
          <Link href="/facilitator-index" className="underline underline-offset-2 hover:text-facilitator-amber-deep">Facilitator Index</Link>.
        </p>
      </div>
    </div>
  );
}
