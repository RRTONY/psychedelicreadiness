import type { Metadata } from "next";
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
  title: "The Medicine Sequencing Ladder — Don't Skip Rungs",
  description:
    "Every plant medicine and psychedelic on one ladder, from gentlest to most profound — six rungs, one principle: don't skip the ladder. A sequencing compass, not a recommendation engine.",
  alternates: { canonical: "/medicine-sequencing" },
};

const SEQUENCING_PHILOSOPHY = [
  "The natural order of the spectrum exists for a reason. Every rung on this ladder builds the nervous system's capacity for the next. You don't go from smoking weed to finding God in an ayahuasca ceremony. You don't skip from kava to ibogaine. The ladder is not a suggestion — it is the accumulated wisdom of every tradition that has worked with these medicines for thousands of years.",
  "This is not a recommendation engine. We are not telling you what to take. We are showing you the natural sequence so you can understand where you are, where you might go next, and what you need to build before you get there.",
  "Half the people who go through this process will realize they're not ready. That is the system working.",
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
          recommendation. It is a map of the natural order.
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
