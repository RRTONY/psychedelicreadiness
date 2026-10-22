import type { Metadata } from "next";
import { CalibrationAssessment } from "@/components/pri/calibration-assessment";

// Ported from legacy client/src/pages/pri/PriCalibration.tsx — see that
// component file for the full port note. Fully stateful (a phase state
// machine drives intro → pairwise → ranking → results), so this route is
// just metadata plus the client-island mount point.
export const metadata: Metadata = {
  title: "PRI Calibration — Psychedelic Readiness Index",
  description: "How the Psychedelic Readiness Index is calibrated and validated, with a real forced-rank psychometric self-assessment.",
  alternates: { canonical: "/pri-calibration" },
};

export default function PriCalibrationPage() {
  return <CalibrationAssessment />;
}
