import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import {
  COMPASS_INTRO,
  COMPASS_WHATS_NEW,
  COMPASS_HOW_IT_WORKS,
  COMPASS_FORMULA,
  COMPASS_FORMULA_NOTE,
  COMPASS_DIMENSIONS,
  COMPASS_RANK_MULTIPLIERS,
  COMPASS_QUESTIONS,
  COMPASS_SUBSTANCE_ROUTING,
  COMPASS_SOURCES,
  COMPASS_VALIDITY_NOTICE,
  COMPASS_REQUIRED_READING,
} from "@/lib/content/pri-iboga-compass-data";

const thClass = "border-b-2 border-[#D4CFC5] bg-[#E8E2D8] px-3 py-2.5 text-left text-xs font-extrabold tracking-[0.08em] whitespace-nowrap text-pri-ink uppercase";
const tdClass = "border-b border-[#E8E2D8] px-3 py-2.5 align-top text-[.95rem] leading-[1.55] text-pri-brown";

function SubSection({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return <div className={`border-t py-12 ${dark ? "border-[#3A3530]" : "border-pri-border"}`}>{children}</div>;
}

// Ported from legacy's `IbogaCompassSection` — the real Compass v2
// methodology documentation (what's new, scoring formula, 10 dimensions,
// priority-rank multipliers, all 28 real questions grouped into
// collapsible sections, substance-to-facility routing, sources, validity
// notice, required reading) that's embedded inline within
// `/iboga-ibogaine`, unchanged and verbatim. The actual interactive
// assessment lives at `/iboga-compass`; this section documents it and
// links there. Each question section expands with native <details> (one
// open at a time via a shared `name`), so this is a Server Component and all
// 28 questions are in the server HTML for search engines (2026-10-08).
export function IbogaCompassSection() {
  return (
    <>
      <section id="compass" className="bg-pri-cream px-5 py-16 text-pri-ink">
        <div className="mx-auto max-w-275">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-pri-purple uppercase">
            <span className="block h-0.5 w-6 bg-pri-purple" />
            The Iboga Compass
          </div>
          <h2 className="mb-4 font-heading font-extrabold text-[clamp(1.8rem,4.5vw,3rem)] text-pri-ink">Assessment — v2</h2>
          <p className="mb-6 max-w-200 text-[1.2rem] text-pri-brown italic">{COMPASS_INTRO.tagline}</p>
          <p className="mb-8 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">{COMPASS_INTRO.description}</p>
          <p className="text-[.95rem] text-[#6B5B3E]">
            —{" "}
            <a href={COMPASS_INTRO.authorUrl} className="text-pri-purple underline">
              {COMPASS_INTRO.author}
            </a>{" "}
            · {COMPASS_INTRO.name}
          </p>

          <SubSection>
            <div className="mb-4 text-[.85rem] font-extrabold tracking-[0.12em] text-pri-purple uppercase">What&apos;s New in Version 2</div>
            <p className="mb-4 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">
              Version 1 was thin on substance breadth and missed several contraindications that real iboga clinics screen for. Version 2 closes those gaps
              and adds a priority-rank step so the user can fine-tune what matters most.
            </p>
            <ol className="max-w-200 list-decimal space-y-2 pl-6 text-[1.05rem] leading-[1.75] text-pri-brown">
              {COMPASS_WHATS_NEW.map((item) => {
                const [first, ...rest] = item.split(" — ");
                return (
                  <li key={item}>
                    <strong>{first}</strong>
                    {rest.length > 0 ? ` — ${rest.join(" — ")}` : ""}
                  </li>
                );
              })}
            </ol>
          </SubSection>

          <SubSection>
            <div className="mb-4 text-[.85rem] font-extrabold tracking-[0.12em] text-pri-purple uppercase">How It Works</div>
            <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">{COMPASS_HOW_IT_WORKS}</p>
            <div className="max-w-150 rounded-lg bg-pri-ink p-6 font-mono text-sm leading-[1.8] text-pri-purple-light">
              <div>{COMPASS_FORMULA}</div>
            </div>
            <p className="mt-4 max-w-200 text-[.95rem] text-pri-brown">{COMPASS_FORMULA_NOTE}</p>
          </SubSection>

          <SubSection>
            <div className="mb-4 text-[.85rem] font-extrabold tracking-[0.12em] text-pri-purple uppercase">The 10 Dimensions</div>
            <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
              <table className="w-full min-w-150 border-collapse">
                <thead>
                  <tr>
                    <th className={thClass}>#</th>
                    <th className={thClass}>Dimension</th>
                    <th className={thClass}>Measures</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPASS_DIMENSIONS.map((d, i) => (
                    <tr key={d.num} className={i % 2 ? "bg-pri-parchment" : ""}>
                      <td className={`${tdClass} font-mono font-bold text-pri-purple`}>{d.num}</td>
                      <td className={`${tdClass} font-bold whitespace-nowrap`}>{d.dimension}</td>
                      <td className={tdClass}>{d.measures}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SubSection>

          <SubSection>
            <div className="mb-4 text-[.85rem] font-extrabold tracking-[0.12em] text-pri-purple uppercase">Priority Rank Multipliers</div>
            <p className="mb-4 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">After the 28 questions, the user reorders dimensions. Position determines multiplier:</p>
            <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
              <table className="w-full max-w-150 border-collapse">
                <thead>
                  <tr>
                    <th className={thClass}>Position</th>
                    <th className={thClass}>Multiplier</th>
                    <th className={thClass}>Effect</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPASS_RANK_MULTIPLIERS.map((r, i) => (
                    <tr key={r.position} className={i % 2 ? "bg-pri-parchment" : ""}>
                      <td className={`${tdClass} font-bold`}>{r.position}</td>
                      <td className={`${tdClass} font-mono font-bold text-pri-purple`}>{r.multiplier}</td>
                      <td className={tdClass}>{r.effect}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 max-w-200 text-[.95rem] text-pri-brown">This compounds with the question-derived weights, then re-normalizes to sum to 1.</p>
          </SubSection>
        </div>
      </section>

      {/* ── THE 28 QUESTIONS ── */}
      <section id="compass-questions" className="bg-pri-ink px-5 py-16 text-pri-cream">
        <div className="mx-auto max-w-275">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-pri-purple-light uppercase">
            <span className="block h-0.5 w-6 bg-pri-purple-light" />
            The 28 Questions
          </div>
          <h2 className="mb-8 font-heading font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] text-pri-cream">Full Question Set</h2>

          {COMPASS_QUESTIONS.map((section) => (
            <details key={section.sectionNum} name="iboga-compass-questions" className="group mb-8">
              <summary className="flex w-full cursor-pointer list-none items-center gap-4 rounded-lg border border-[#3A3530] bg-white/4 px-5 py-4 text-left transition-colors group-open:border-pri-purple-light group-open:bg-pri-purple-light/12 [&::-webkit-details-marker]:hidden">
                <span className="min-w-10 font-mono text-[.85rem] font-bold text-pri-purple-light">{String(section.sectionNum).padStart(2, "0")}</span>
                <span className="flex-1 text-[1.05rem] font-bold text-pri-cream">{section.sectionTitle}</span>
                <span className="text-[.85rem] text-pri-cream/60">
                  {section.questions.length} question{section.questions.length > 1 ? "s" : ""}
                </span>
                <ChevronDown aria-hidden="true" className="size-5 text-pri-purple-light transition-transform group-open:rotate-180" />
              </summary>
              <div className="rounded-b-lg border border-t-0 border-[#3A3530] bg-white/2 px-5 py-6">
                {section.questions.map((q) => (
                  <div key={q.id} className="mb-6">
                    <p className="mb-2 text-base font-bold text-pri-cream">
                      <span className="mr-2 font-mono text-pri-purple-light">{q.id}.</span>
                      {q.text}
                    </p>
                    {q.note && <p className="mb-2 text-[.9rem] text-pri-cream/60 italic">{q.note}</p>}
                    <ul className="m-0 list-disc space-y-1 pl-6">
                      {q.options.map((opt) => (
                        <li key={opt} className="text-[.95rem] leading-[1.7] text-pri-cream/80">
                          {opt.includes("→") ? (
                            <>
                              {opt.split("→")[0]}
                              <span className="font-semibold text-pri-purple-light">→ {opt.split("→")[1]}</span>
                            </>
                          ) : opt.includes("EXCLUDES") ? (
                            <span className="font-bold text-[#EF4444]">{opt}</span>
                          ) : (
                            opt
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          ))}

          <p className="mt-8 text-[.95rem] text-pri-cream/60">
            <strong className="text-pri-purple-light">Final Step — Priority Rank:</strong> After 28 questions, the user sees their pre-ranked 10 dimensions.
            They can tap up/down arrows to reorder. Top 3 weighted ×1.4 to ×2.0. Bottom 3 weighted ×0.5 to ×0.7.
          </p>
        </div>
      </section>

      {/* ── SUBSTANCE ROUTING ── */}
      <section id="compass-routing" className="bg-pri-cream px-5 py-16 text-pri-ink">
        <div className="mx-auto max-w-275">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-pri-purple uppercase">
            <span className="block h-0.5 w-6 bg-pri-purple" />
            Substance-to-Facility Routing
          </div>
          <h2 className="mb-4 font-heading font-extrabold text-[clamp(1.4rem,3.5vw,2.2rem)] text-pri-ink">How Substance Selections Route to Facilities</h2>
          <p className="mb-6 max-w-200 text-[1.05rem] leading-[1.75] text-pri-brown">Additive boosts — selecting multiple substances compounds all routing bonuses.</p>
          <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
            <table className="w-full min-w-175 border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>Substance</th>
                  <th className={thClass}>Top Facilities</th>
                </tr>
              </thead>
              <tbody>
                {COMPASS_SUBSTANCE_ROUTING.map((r, i) => (
                  <tr key={r.substance} className={i % 2 ? "bg-pri-parchment" : ""}>
                    <td className={`${tdClass} font-bold whitespace-nowrap`}>{r.substance}</td>
                    <td className={`${tdClass} font-mono text-[.88rem]`}>{r.facilities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SOURCES ── */}
      <section id="compass-sources" className="bg-pri-ink px-5 py-12 text-pri-cream">
        <div className="mx-auto max-w-275">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-pri-purple-light uppercase">
            <span className="block h-0.5 w-6 bg-pri-purple-light" />
            Cross-Referenced Sources
          </div>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            {COMPASS_SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[.95rem] text-pri-purple-light underline">
                  {s.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── VALIDITY NOTICE ── */}
      <section id="compass-validity" className="bg-pri-cream px-5 py-12 text-pri-ink">
        <div className="mx-auto max-w-225">
          <div className="border-l-4 border-[#581C87] bg-[#F3E8FF] p-5">
            <p className="m-0 mb-2 flex items-center gap-2 text-base font-extrabold text-[#581C87]">
              <AlertTriangle className="size-4" />
              Validity Notice
            </p>
            <p className="m-0 text-[.95rem] leading-[1.7] text-pri-brown">{COMPASS_VALIDITY_NOTICE}</p>
          </div>
        </div>
      </section>

      {/* ── REQUIRED READING ── */}
      <section id="compass-reading" className="bg-pri-ink px-5 py-12 text-pri-cream">
        <div className="mx-auto max-w-225">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-pri-purple-light uppercase">
            <span className="block h-0.5 w-6 bg-pri-purple-light" />
            Required Reading
          </div>
          <ul className="mt-4 mb-8 list-disc space-y-3 pl-5">
            {COMPASS_REQUIRED_READING.map((r) => (
              <li key={r.url}>
                <a href={r.url} className="text-base font-bold text-pri-purple-light underline">
                  {r.text}
                </a>
                <span className="text-[.9rem] text-pri-cream/60"> — {r.desc}</span>
              </li>
            ))}
          </ul>
          <p className="text-center font-heading text-[1.1rem] text-pri-purple-light italic">The gold is in the cracks.</p>

          <div className="my-10 text-center">
            <Link href="/iboga-compass" className="inline-block rounded-lg bg-linear-to-br from-pri-purple to-pri-purple-mid px-10 py-4 text-[1.1rem] font-bold tracking-[0.04em] text-white shadow-[0_4px_20px_rgba(107,33,168,.35)]">
              Take the Compass Assessment
            </Link>
            <p className="mt-3 text-[.85rem] text-pri-cream/60">28 questions · 5 minutes · ranked facility matches</p>
          </div>

          <p className="mt-3 text-center text-[.9rem] text-pri-cream/60">
            <a href="https://tonygreenberg.com" className="text-pri-purple-light">
              tonygreenberg.com
            </a>
            {" · "}
            <a href="https://impactsoul.is" className="text-pri-purple-light">
              impactsoul.is
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
