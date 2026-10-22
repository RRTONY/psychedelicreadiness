import { FACILITATOR_BANDS } from "@/lib/content/facilitator-index-data";
import { PrintedOn } from "@/components/facilitator/printed-on";

// The printable Facilitator Index question set (all 108 items as a fillable questionnaire),
// shown only when printing (`hidden print:block`). Built from FACILITATOR_BANDS, the same data
// the page renders, so the print copy can't drift from it (legacy's hand-written print copy had).
export function FacilitatorPrintSheet() {
  return (
    <article className="hidden bg-white font-[Georgia,serif] text-[10.5pt] leading-[1.65] text-facilitator-ink print:block">
      <header className="mb-6 break-after-avoid border-b-2 border-facilitator-amber-deep pt-10 pb-8 text-center">
        <div className="mb-2 text-[7.5pt] tracking-[0.18em] text-facilitator-amber-deep uppercase">
          Companion to the Psychedelic Readiness Index · v1.0 Pilot · Invitation Only
        </div>
        <p className="mb-1 text-[22pt] font-bold">The Facilitator Index</p>
        <p className="mb-2 text-[9.5pt] text-facilitator-ink/55">Know Who You Go With — 108 Items Across Twelve Bands</p>
        <p className="mb-2 text-[9.5pt] text-facilitator-ink/55">A philosophy-first instrument for practitioners who hold non-ordinary states</p>
        <p className="text-[7.5pt] tracking-[0.04em] text-facilitator-ink/40">© 2026 Tony Greenberg · All Rights Reserved · Patent Pending · tonygreenberg.com</p>
      </header>
      <p className="mb-1 text-[7.5pt] text-facilitator-ink/40 italic">
        Unless otherwise noted, items are open-ended. Write as much or as little as you need. There are no right answers — only honest ones.
      </p>
      <hr className="mt-5 mb-3 border-facilitator-ink/12" />

      {FACILITATOR_BANDS.map((band) => (
        <section key={band.id}>
          <div className="mt-6 mb-1 break-after-avoid">
            <span className="block text-[7pt] font-bold tracking-[0.18em] text-facilitator-amber-deep uppercase">{band.label}</span>
            <h2 className="text-[13pt] font-bold">{band.title}</h2>
            {band.note && <p className="mt-0.5 text-[8.5pt] text-facilitator-ink/45 italic">{band.note}</p>}
          </div>
          {band.traditions?.map((t) => (
            <div key={`t${t.n}`} className="flex break-inside-avoid items-start gap-2 border-b border-facilitator-ink/7 py-2">
              <span className="min-w-8 shrink-0 pt-0.5 text-[7.5pt] font-bold text-facilitator-amber-deep">T{t.n}.</span>
              <span className="flex-1 text-[10pt]">{t.text}</span>
            </div>
          ))}
          {band.items.map((item) => (
            <div key={item.n} className="flex break-inside-avoid items-start gap-2 border-b border-facilitator-ink/7 py-2">
              <span className="min-w-8 shrink-0 pt-0.5 text-[7.5pt] font-bold text-facilitator-amber-deep">{item.n}.</span>
              <span className="flex-1 text-[10pt]">
                {item.text}
                <span className="mt-1.5 mb-1 block h-4.5 border-b border-facilitator-ink/15" />
              </span>
            </div>
          ))}
          <hr className="mt-5 mb-3 border-facilitator-ink/12" />
        </section>
      ))}

      <footer className="mt-8 border-t-2 border-facilitator-amber-deep pt-4 text-center text-[7.5pt] leading-[1.7] text-facilitator-ink/45">
        The Facilitator Index · v1.0 Pilot · © 2026 Tony Greenberg · All Rights Reserved · Patent Pending
        <br />
        This document is for personal professional self-assessment only. Not for reproduction, distribution, or derivative use without written license.
        <br />
        psychedelicreadiness.com/facilitator-index · Printed: <PrintedOn />
      </footer>
    </article>
  );
}
