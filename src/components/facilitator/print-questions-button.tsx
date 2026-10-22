"use client";

import { Printer } from "lucide-react";

// Opens the browser's print dialog (which also offers "Save as PDF"). What prints is
// <FacilitatorPrintSheet> (facilitator-print-sheet.tsx), a React component that's hidden on
// screen; the page itself is `print:hidden`. Replaces the legacy port's HTML string written into
// a pop-up window.
export function PrintQuestionsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-br from-facilitator-amber-deep to-facilitator-amber-light px-6 py-2.5 text-[.82rem] font-bold tracking-[0.06em] text-facilitator-ink"
    >
      <Printer aria-hidden="true" className="size-4" /> {label}
    </button>
  );
}
