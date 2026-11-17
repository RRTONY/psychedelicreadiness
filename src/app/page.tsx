import type { Metadata } from "next";
import { SITE_OPEN_GRAPH } from "@/lib/site-open-graph";
import { PsychedelicReadinessIndex } from "@/components/pri/psychedelic-readiness-index";
import { MEDICINES } from "@/lib/content/pri-data";
import { SAFETY_DATA } from "@/lib/content/pri-safety-data";

// Ported from legacy client/src/pages/pri/PsychedelicReadinessIndex.tsx —
// see that component file for the full port-note on what changed. Fully
// stateful (a single state machine drives the whole page), so this route
// is just metadata plus the client-island mount point.
export const metadata: Metadata = {
  title: "Psychedelic Readiness Index — Find Your Medicine",
  description:
    "39 substances. 50+ readiness questions. 6 domains. MAO-B interaction matrix. An honest map of where you stand before you walk into territory that rewards preparation.",
  alternates: { canonical: "/" },
  openGraph: { ...SITE_OPEN_GRAPH, url: "/" },
};

// Tony's emergency holds from tonygreenberg.com (#44 ibogaine, #48 the medicines with no
// reviewed safety data), copied 2026-11-18: tonygreenberg.com now redirects ?m= links here,
// so without this the redirect went around them. Held before the assessment mounts.
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string | string[] }>;
}) {
  const { m } = await searchParams;
  const selectedIds = Array.isArray(m) ? m : m ? [m] : [];
  const holdsIbogaine = selectedIds.includes("ibogaine");
  const unreviewed = selectedIds
    .map((id) => MEDICINES.find((medicine) => medicine.id === id && !SAFETY_DATA[medicine.id]))
    .find(Boolean);
  if (holdsIbogaine || unreviewed) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-6 py-16 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-red-700">
          Temporary safety hold
        </p>
        <h1 className="mb-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          This assessment is temporarily unavailable
        </h1>
        <p className="mb-4 text-lg leading-relaxed">
          The {holdsIbogaine ? "ibogaine" : unreviewed?.name} readiness assessment is paused pending medical and safety review.
          No scores, suitability recommendations, or medicine matches are being issued here.
        </p>
        <p className="text-base leading-relaxed">
          A personal assessment cannot establish medical safety. Consult a qualified
          healthcare professional for individual guidance. Do not change prescribed medications to prepare for psychedelic use.
        </p>
      </div>
    );
  }
  return <PsychedelicReadinessIndex />;
}
