import type { Metadata } from "next";
import { IbogaCompassAssessment } from "@/components/pri/iboga-compass-assessment";

// Ported from legacy client/src/pages/pri/IbogaCompassAssessment.tsx — see
// that component file for the full port note. Fully stateful (a phase
// state machine drives questions → rank → lead-capture gate → results), so
// this route is just metadata plus the client-island mount point.
export const metadata: Metadata = {
  title: "Iboga Compass Assessment — PRI",
  description: "A personalized assessment to determine your readiness and fit for iboga or ibogaine therapy, matched against a real facility directory.",
  alternates: { canonical: "/iboga-compass" },
};

export default function IbogaCompassPage() {
  return <IbogaCompassAssessment />;
}
