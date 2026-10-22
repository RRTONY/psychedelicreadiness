import type { Medicine } from "@/lib/content/pri-data";
import { DIM_LABELS, type DimKey } from "@/lib/content/pri-data";
import type { computeScores } from "@/lib/content/pri-shared";

type Results = ReturnType<typeof computeScores>;

// The printable "Personal Report" behind "Save My Results". It's a normal React component,
// hidden on screen (`hidden print:block`); the button calls window.print(), so the browser's
// print dialog (and its "Save as PDF") prints only this. Replaces the legacy port's HTML string
// written into a pop-up window, which pasted medicine text in unescaped and was blocked by
// pop-up blockers.

const BAR_CLASS = {
  high: "bg-[#2E7D32]",
  mid: "bg-pri-purple-mid",
  low: "bg-pri-purple",
} as const;

function barClass(score: number, high: number, mid: number) {
  return score >= high ? BAR_CLASS.high : score >= mid ? BAR_CLASS.mid : BAR_CLASS.low;
}

function Bar({ value, className }: { value: number; className: string }) {
  return (
    <div className="h-2 overflow-hidden rounded bg-[#F0EBE3]">
      {/* The width is the one value that can't be a class (CONTRIBUTING, Tailwind section). */}
      <div className={`h-full rounded ${className}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 mb-4 break-after-avoid border-b-2 border-pri-purple pb-1.5 text-[.85rem] font-extrabold tracking-[0.12em] text-pri-purple uppercase">
      {children}
    </h2>
  );
}

const CELL = "border-b border-[#E8E0D6] px-3.5 py-2.5";
const HEAD = "border-b-2 border-pri-ink px-3.5 py-2 text-left text-[.75rem] tracking-[0.08em] uppercase";

export function PriReport({ results, savedMeds, date }: { results: Results; savedMeds: Medicine[]; date: string }) {
  return (
    <article className="mx-auto hidden max-w-195 bg-white px-8 py-10 font-[Georgia,'Times_New_Roman',serif] text-pri-ink print:block print:p-0">
      <header className="mb-8 border-b-[3px] border-pri-ink pb-6 text-center">
        <div className="mb-2 text-[.7rem] font-extrabold tracking-[0.2em] text-pri-purple uppercase">ImpactSoul &times; PsychedelicReadiness.com</div>
        <p className="text-[1.8rem] font-black tracking-[-0.02em]">Psychedelic Readiness Index</p>
        <div className="mt-1.5 text-[.8rem] text-pri-tan">Personal Report &middot; {date}</div>
      </header>

      <section className="my-8 break-inside-avoid border border-[#E8E0D6] bg-pri-parchment p-8 text-center">
        <div className="text-[4.5rem] leading-none font-black text-pri-purple">{results.overall}</div>
        <div className="mt-1 font-bold tracking-widest uppercase">{results.level.label}</div>
        <p className="mx-auto mt-3 max-w-120 text-[.85rem]/relaxed text-pri-tan">{results.level.description}</p>
      </section>

      <SectionTitle>Dimension Breakdown</SectionTitle>
      <table className="w-full border-collapse">
        <tbody>
          {(Object.keys(results.dimScores) as DimKey[]).map((d) => {
            const score = results.dimScores[d];
            return (
              <tr key={d}>
                <td className={`${CELL} w-2/5 font-bold`}>{DIM_LABELS[d]}</td>
                <td className={`${CELL} w-2/5`}>
                  <Bar value={score} className={barClass(score, 75, 50)} />
                </td>
                <td className={`${CELL} w-1/5 text-center text-[1.1rem] font-black`}>
                  {score}
                  <small className="text-[.7rem] font-normal text-pri-tan">/100</small>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <SectionTitle>Top Medicine Matches</SectionTitle>
      <table className="w-full border-collapse">
        <tbody>
          {results.topMatches.map((m, i) => (
            <tr key={m.id}>
              <td className={`${CELL} w-[8%] font-extrabold text-pri-purple`}>#{i + 1}</td>
              <td className={`${CELL} w-[32%] font-bold`}>{m.name}</td>
              <td className={`${CELL} w-2/5`}>
                <Bar value={m.matchScore} className={barClass(m.matchScore, 80, 60)} />
              </td>
              <td className={`${CELL} w-1/5 text-center font-extrabold`}>{m.matchScore}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <SectionTitle>Recommended Healing Sequence</SectionTitle>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={HEAD}>Step &amp; Rationale</th>
            <th className={HEAD}>Timing</th>
            <th className={HEAD}>Est. Cost</th>
          </tr>
        </thead>
        <tbody>
          {results.sequence.map((s, i) => (
            <tr key={s.name} className="break-inside-avoid">
              <td className={`${CELL} py-3`}>
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-pri-purple text-[.7rem] font-black text-white">{i + 1}</span>
                  <strong>{s.name}</strong>
                </div>
                <div className="mt-1 pl-8 text-[.82rem] text-pri-tan">{s.why}</div>
              </td>
              <td className={`${CELL} py-3 align-top text-[.85rem] whitespace-nowrap text-pri-brown`}>{s.time}</td>
              <td className={`${CELL} py-3 align-top font-bold whitespace-nowrap`}>{s.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {savedMeds.length > 0 && (
        <>
          <SectionTitle>My Saved Medicines</SectionTitle>
          <div className="my-4 grid grid-cols-3 gap-2">
            {savedMeds.map((m) => (
              <div key={m.id} className="border border-[#E8E0D6] bg-[#F8F5F0] px-3.5 py-2.5">
                <div className="text-[.9rem] font-bold">{m.name}</div>
                <div className="text-[.75rem] tracking-[0.04em] text-pri-tan uppercase">{m.src}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="mt-10 break-inside-avoid border border-[#E8E0D6] bg-[#FFF8E1] px-5 py-4 text-[.78rem]/[1.7] text-[#5D4E3C]">
        <strong className="text-pri-purple">Disclaimer:</strong> This is not medical advice. The Psychedelic Readiness Index is a community-aggregated
        educational tool. It does not constitute medical advice, diagnosis, or treatment. No medicine, provider, or protocol listed here constitutes an
        endorsement or recommendation. Always consult qualified healthcare professionals before engaging with any psychedelic substance. You proceed entirely
        at your own risk. Many substances discussed are illegal in various jurisdictions. You are responsible for knowing and following the laws where you
        live.
      </p>
      <footer className="mt-8 border-t border-[#E8E0D6] pt-4 text-center text-[.75rem] text-[#A09080]">Generated at psychedelicreadiness.com &middot; {date}</footer>
    </article>
  );
}
