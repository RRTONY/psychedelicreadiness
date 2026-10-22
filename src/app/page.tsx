import type { Metadata } from "next";
import { PsychedelicReadinessIndex } from "@/components/pri/psychedelic-readiness-index";

// Ported from legacy client/src/pages/pri/PsychedelicReadinessIndex.tsx —
// see that component file for the full port-note on what changed. Fully
// stateful (a single state machine drives the whole page), so this route
// is just metadata plus the client-island mount point.
export const metadata: Metadata = {
  title: "Psychedelic Readiness Index — Find Your Medicine",
  description:
    "39 plant medicines. 50+ readiness questions. 6 domains. MAO-B interaction matrix. An honest map of where you stand before you walk into territory that rewards preparation.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <PsychedelicReadinessIndex />;
}
