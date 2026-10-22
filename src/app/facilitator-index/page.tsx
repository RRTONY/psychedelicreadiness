import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FACILITATOR_HERO_IMAGE } from "@/lib/content/facilitator-index-data";
import { FacilitatorIndexContent } from "@/components/facilitator/facilitator-index-content";
import { FacilitatorPrintSheet } from "@/components/facilitator/facilitator-print-sheet";

// Ported from legacy client/src/pages/pri/FacilitatorIndex.tsx — "The
// Facilitator Index: Know Who You Go With." See
// `facilitator-index-content.tsx` for the full port note (what's real,
// what's dropped, and why). This page renders the real hero (one
// confirmed-live CloudFront photo) and mounts the client content below it.
// Legacy's two in-body section images (`facilitator-bands`,
// `facilitator-compass`) lived on the Manus `/api/img/` proxy; they were
// rescued into Sanity on 2026-09-29 (scripts/rescue-facilitator-images.ts)
// and render inside `facilitator-index-content.tsx`. Legacy's global copy/right-click-blocking `useEffect`
// (billed as "IP protection") is dropped — it provides no real security
// (trivially bypassed) while actively frustrating legitimate visitors
// (can't copy their own draft answers, can't open a link in a new tab);
// that's a cost this migration isn't willing to impose for zero real
// benefit. The decorative copyright watermark SVG overlay is kept — it's
// cheap, harmless, and a real part of this page's specific visual
// identity.
export const metadata: Metadata = {
  title: "The Facilitator Index — Know Who You Go With",
  description:
    "An anonymous, philosophy-first instrument for practitioners who hold non-ordinary states. 108 items across twelve bands. Companion to the Psychedelic Readiness Index.",
  alternates: { canonical: "/facilitator-index" },
};

export default function FacilitatorIndexPage() {
  return (
    <>
    <div className="min-h-screen bg-linear-to-br from-[#FFFBF2] via-[#FFF4E0] to-[#F5F0FF] font-body text-facilitator-ink print:hidden">
      {/* Watermark overlay */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-9999 overflow-hidden opacity-5.5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wm" x="0" y="0" width="360" height="110" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
              <text x="10" y="38" fontSize="12" fill="#1A1208" fontFamily="monospace" fontWeight="600">
                © Tony Greenberg · All Rights Reserved · tonygreenberg.com
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wm)" />
        </svg>
      </div>

      {/* Hero */}
      <div className="relative h-[clamp(380px,60vw,620px)] w-full overflow-hidden">
        <Image src={FACILITATOR_HERO_IMAGE} alt="" fill sizes="100vw" fetchPriority="high" loading="eager" className="object-cover object-[center_35%] brightness-92 contrast-105 saturate-140" />
        <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-b from-[#FFF8EB]/8 to-[#140828]/72 p-6 sm:p-12">
          <span className="mb-4 block text-[clamp(.75rem,2vw,.85rem)] font-bold tracking-[0.18em] text-[#FDE68A] uppercase [text-shadow:0_1px_6px_rgba(0,0,0,.7)]">
            Companion to the Psychedelic Readiness Index · Invitation Only · v1.0 Pilot
          </span>
          <h1 className="mb-3 max-w-190 font-heading text-[clamp(2.4rem,7vw,4.2rem)] leading-[1.08] font-bold text-[#FFFBF2] [text-shadow:0_3px_16px_rgba(0,0,0,.6)]">
            The Facilitator Index
          </h1>
          <p className="max-w-140 text-[clamp(1rem,2.5vw,1.2rem)] leading-[1.55] text-[#FFF8EB]/92 [text-shadow:0_1px_8px_rgba(0,0,0,.55)]">
            Know Who You Go With ·{" "}
            <a href="https://tonygreenberg.com/about" className="text-facilitator-amber-deep">
              Tony Greenberg
            </a>{" "}
            ·{" "}
            <Link href="/" className="text-facilitator-amber-deep">
              Psychedelic Readiness Index
            </Link>
          </p>
        </div>
      </div>

      <FacilitatorIndexContent />
    </div>
    <FacilitatorPrintSheet />
    </>
  );
}
