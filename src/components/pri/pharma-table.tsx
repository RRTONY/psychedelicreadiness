"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { PHARMA_ALTERNATIVES } from "@/lib/content/pri-mescaline-module";

// Ported from legacy's `PharmaTable` — the real 16-row pharma-to-plant
// alternatives table with real evidence-strength badges, unchanged.
// Show-all/collapse toggle is the only interactive piece, extracted here.
export function PharmaTable() {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? PHARMA_ALTERNATIVES : PHARMA_ALTERNATIVES.slice(0, 8);

  return (
    <div>
      <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
        <table className="w-full min-w-200 border-collapse">
          <thead>
            <tr>
              <th className="border-b-2 border-[#D4CFC5] bg-[#E8E2D8] px-3 py-2.5 text-left text-xs font-extrabold tracking-[0.08em] whitespace-nowrap text-pri-ink uppercase">Drug (Brand)</th>
              <th className="border-b-2 border-[#D4CFC5] bg-[#E8E2D8] px-3 py-2.5 text-left text-xs font-extrabold tracking-[0.08em] whitespace-nowrap text-pri-ink uppercase">Category</th>
              <th className="border-b-2 border-[#D4CFC5] bg-[#E8E2D8] px-3 py-2.5 text-left text-xs font-extrabold tracking-[0.08em] whitespace-nowrap text-pri-ink uppercase">Plant Alternative</th>
              <th className="border-b-2 border-[#D4CFC5] bg-[#E8E2D8] px-3 py-2.5 text-left text-xs font-extrabold tracking-[0.08em] whitespace-nowrap text-pri-ink uppercase">Supplement Alt</th>
              <th className="border-b-2 border-[#D4CFC5] bg-[#E8E2D8] px-3 py-2.5 text-left text-xs font-extrabold tracking-[0.08em] whitespace-nowrap text-pri-ink uppercase">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.drug} className={i % 2 ? "bg-pri-parchment" : ""}>
                <td className="border-b border-[#E8E2D8] px-3 py-2.5 align-top text-[.82rem] leading-[1.5] text-pri-brown">
                  <strong className="text-pri-ink">{r.drug}</strong>
                </td>
                <td className="border-b border-[#E8E2D8] px-3 py-2.5 align-top text-[.82rem] leading-[1.5] text-pri-brown">
                  <span className="text-xs font-bold tracking-[0.06em] text-pri-tan uppercase">{r.category}</span>
                </td>
                <td className="border-b border-[#E8E2D8] px-3 py-2.5 align-top text-[.82rem] leading-[1.5] text-pri-brown">
                  {r.plantAlt.includes("⚠") ? <span className="font-bold text-[#581C87]">{r.plantAlt}</span> : r.plantAlt}
                </td>
                <td className="border-b border-[#E8E2D8] px-3 py-2.5 align-top text-[.82rem] leading-[1.5] text-pri-brown">{r.supplementAlt}</td>
                <td className="border-b border-[#E8E2D8] px-3 py-2.5 align-top text-[.82rem] leading-[1.5] text-pri-brown">
                  <span
                    className={`border px-1.5 py-0.5 text-xs font-bold ${
                      r.evidence.startsWith("Strong")
                        ? "border-[#6B8F71]/30 bg-[#6B8F71]/15 text-[#3D6B44]"
                        : r.evidence.startsWith("Moderate")
                          ? "border-[#C8A64C]/30 bg-[#C8A64C]/15 text-[#7A5C10]"
                          : "border-pri-purple/20 bg-pri-purple/10 text-pri-purple"
                    }`}
                  >
                    {r.evidence}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!expanded && PHARMA_ALTERNATIVES.length > 8 && (
        <div className="mt-4 text-center">
          <button onClick={() => setExpanded(true)} className="inline-flex items-center gap-1.5 border-[1.5px] border-pri-ink px-6 py-2.5 text-[.78rem] font-bold text-pri-ink min-h-11 md:min-h-6">
            Show All {PHARMA_ALTERNATIVES.length} Medications
            <ArrowDown aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
