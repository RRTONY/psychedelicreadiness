import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowDown, ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  MESCALINE_PHARMACOLOGY,
  LATUDA_MIRROR,
  LATUDA_MIRROR_ONELINER,
  MESCALINE_OUTCOMES,
  OUTCOMES_SOURCE,
  OUTCOMES_SPIRITUAL,
  OUTCOMES_INTENT,
  SUPPLEMENT_STACKS,
  MESCALINE_DIM_SCORES,
  MEDICINE_SELECTOR,
  MESCALINE_SOURCES,
  MESCALINE_META,
  MESCALINE_DISCLAIMER,
} from "@/lib/content/pri-mescaline-module";
import { TAG_CLASS, DEFAULT_TAG_CLASS } from "@/lib/content/pri-shared";
import { PriSection, PriEyebrow } from "@/components/pri/pri-section";
import { PharmaTable } from "@/components/pri/pharma-table";

// Ported from legacy client/src/pages/pri/MescalineDeepDive.tsx — the real
// receptor pharmacology table, the real "Latuda Mirror" comparison, real
// clinical outcomes data (Agin-Liebes et al. 2021, n=452), the real 16-row
// pharma-to-plant alternatives table, real supplement protocol, real
// mescaline-specific PRI dimension scores, the real medicine-selector
// comparison table, and real sources, all ported unchanged and verbatim.
// Fully static except the pharma-table expand toggle (`pharma-table.tsx`),
// so this stays a plain Server Component. Legacy's purely decorative
// glitch-scanline overlay divs are dropped (real photography kept),
// same call made throughout this migration.
export const metadata: Metadata = {
  title: "Mescaline / Peyote Deep Dive — Psychedelic Readiness Index",
  description:
    "Comprehensive pharmacology, outcomes data, pharma-to-plant alternatives, supplement stacks, and readiness dimensions for mescaline and peyote.",
  alternates: { canonical: "/peyote-mescaline" },
};

const thClass = "border-b-2 border-[#D4CFC5] bg-[#E8E2D8] px-3 py-2.5 text-left text-xs font-extrabold tracking-[0.08em] whitespace-nowrap text-pri-ink uppercase";
const tdClass = "border-b border-[#E8E2D8] px-3 py-2.5 align-top text-[.82rem] leading-[1.5] text-pri-brown";

/** Medicine-selector cell: a "✓" in the data renders as a check icon with screen-reader text. */
function SelectorMark({ value }: { value: string }) {
  if (value !== "✓") return value;
  return (
    <>
      <Check aria-hidden="true" className="mx-auto size-4" />
      <span className="sr-only">Yes</span>
    </>
  );
}

export default function PeyoteMescalinePage() {
  return (
    <div className="bg-pri-cream font-body text-pri-ink leading-[1.7]">
      {/* ── HERO ── */}
      <section className="relative mx-auto flex min-h-[80vh] max-w-225 flex-col justify-center overflow-hidden px-5 pt-22 pb-16">
        <div className="absolute top-[5%] right-[-8%] z-0 h-3/4 w-1/2 overflow-hidden rounded-3xl opacity-30">
          <Image
            src="https://cdn.sanity.io/images/a3q1cyqs/production/d63325647995d649a53f8850e89974f071b2170e-1920x1072.webp"
            alt=""
            fill
            sizes="50vw"
            className="object-cover brightness-80 contrast-120"
          />
        </div>
        <div className="relative z-10">
          <PriEyebrow>PRI Deep Dive Module</PriEyebrow>
          <h1 className="mb-4 font-heading text-[clamp(2.5rem,8vw,5rem)] leading-none font-black tracking-[-0.03em] text-pri-ink">
            <span className="text-pri-purple">Mescaline</span> /<br />
            Peyote
          </h1>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {MESCALINE_META.tags.map((t) => (
              <span key={t} className={`border px-2 py-0.5 text-xs font-bold tracking-[0.08em] uppercase ${TAG_CLASS[t] ?? DEFAULT_TAG_CLASS}`}>
                {t}
              </span>
            ))}
            <span className="text-xs font-semibold text-pri-tan">
              {MESCALINE_META.duration} · {MESCALINE_META.potencyNote}
            </span>
          </div>

          <div className="border-l-4 border-[#581C87] bg-[#F3E8FF] p-5">
            <div className="mb-1 flex items-center gap-1.5 text-[.72rem] font-extrabold tracking-[0.06em] text-[#581C87] uppercase">
              <AlertTriangle className="size-3.5" />
              Educational Only — Not Medical Advice
            </div>
            <p className="m-0 text-[.82rem] leading-[1.6] text-pri-brown">{MESCALINE_DISCLAIMER}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center gap-1.5 border-[1.5px] border-pri-ink px-8 py-3.5 text-sm font-bold tracking-[0.05em] text-pri-ink uppercase">
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              Back to PRI
            </Link>
            <a href="#pharmacology" className="inline-flex items-center gap-1.5 bg-pri-purple px-8 py-3.5 text-sm font-bold tracking-[0.05em] text-pri-cream uppercase">
              Explore Pharmacology
              <ArrowDown aria-hidden="true" className="size-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── PHARMACOLOGY ── */}
      <PriSection id="pharmacology">
        <div className="relative mb-8 h-[clamp(180px,25vw,280px)] w-full overflow-hidden rounded-md shadow-[0_8px_40px_rgba(107,33,168,.15)]">
          <Image
            src="https://cdn.sanity.io/images/a3q1cyqs/production/2df10596e3944eecf05511fb6164ee34ee2bf198-1920x1288.webp"
            alt="Receptor pharmacology"
            fill
            sizes="100vw"
            className="object-cover brightness-85 contrast-115"
          />
        </div>
        <PriEyebrow>Receptor Pharmacology</PriEyebrow>
        <h2 className="mb-6 font-heading text-[clamp(1.5rem,4vw,2.5rem)] text-pri-ink">Key Receptors</h2>
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
          <table className="w-full min-w-125 border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Receptor</th>
                <th className={thClass}>Action</th>
                <th className={thClass}>Clinical Use</th>
              </tr>
            </thead>
            <tbody>
              {MESCALINE_PHARMACOLOGY.map((r, i) => (
                <tr key={r.receptor} className={i % 2 ? "bg-pri-parchment" : ""}>
                  <td className={`${tdClass} font-bold text-pri-ink`}>{r.receptor}</td>
                  <td className={tdClass}>{r.action}</td>
                  <td className={tdClass}>{r.clinicalUse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[.82rem] leading-[1.7] text-pri-tan">
          Unlike MDMA and SSRIs, mescaline has <strong className="text-pri-ink">no serotonin transporter (SERT) affinity</strong> — it does not dump
          serotonin. Its psychedelic action is purely receptor-mediated via 5-HT2A partial agonism, with unique prosocial effects from low-affinity dopamine
          binding and sympathomimetic arousal from adrenergic agonism.
        </p>
      </PriSection>

      {/* ── LATUDA MIRROR ── */}
      <PriSection id="latuda-mirror" dark>
        <div className="relative mb-8 h-[clamp(180px,25vw,280px)] w-full overflow-hidden rounded-md">
          <Image
            src="https://cdn.sanity.io/images/a3q1cyqs/production/6fa3d0279b69ce5b6b8aa5e8d37c3a431dcf9049-1920x1072.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-70 contrast-120"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent from-40% to-pri-ink" />
        </div>
        <PriEyebrow>The Latuda Mirror</PriEyebrow>
        <h2 className="mb-3 font-heading text-[clamp(1.5rem,4vw,2.5rem)] text-pri-cream">Same Targets. Opposite Actions.</h2>
        <p className="mb-8 max-w-150 text-[clamp(.9rem,2.5vw,1.05rem)] text-pri-cream/60">
          Latuda (lurasidone) and mescaline share the same receptor targets with opposite actions:
        </p>
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
          <table className="w-full min-w-115 border-collapse">
            <thead>
              <tr>
                <th className="border-b border-pri-cream/10 bg-pri-cream/8 px-3 py-2.5 text-left text-xs font-extrabold tracking-[0.08em] whitespace-nowrap text-pri-cream/65 uppercase">Receptor</th>
                <th className="border-b border-pri-cream/10 bg-pri-cream/8 px-3 py-2.5 text-left text-xs font-extrabold tracking-[0.08em] whitespace-nowrap text-pri-cream/65 uppercase">Latuda</th>
                <th className="border-b border-pri-cream/10 bg-pri-cream/8 px-3 py-2.5 text-left text-xs font-extrabold tracking-[0.08em] whitespace-nowrap text-pri-cream/65 uppercase">Mescaline</th>
              </tr>
            </thead>
            <tbody>
              {LATUDA_MIRROR.map((r, i) => (
                <tr key={r.receptor} className={i % 2 ? "bg-pri-cream/3" : ""}>
                  <td className="border-b border-pri-cream/6 px-3 py-2.5 text-[.85rem] font-bold text-pri-cream">{r.receptor}</td>
                  <td className="border-b border-pri-cream/6 px-3 py-2.5 text-[.85rem] text-pri-cream/55">
                    <span className="text-[#E57373]">{r.latuda}</span>
                  </td>
                  <td className="border-b border-pri-cream/6 px-3 py-2.5 text-[.85rem] text-pri-cream/55">
                    <span className="text-[#81C784]">{r.mescaline}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 border-l-4 border-pri-purple bg-pri-purple/12 px-8 py-6">
          <p className="m-0 font-heading text-[clamp(1rem,3vw,1.2rem)] leading-[1.5] font-bold text-pri-cream">&ldquo;{LATUDA_MIRROR_ONELINER}&rdquo;</p>
        </div>
      </PriSection>

      {/* ── OUTCOMES ── */}
      <PriSection id="outcomes">
        <div className="relative mb-8 h-[clamp(180px,25vw,280px)] w-full overflow-hidden rounded-md">
          <Image
            src="https://cdn.sanity.io/images/a3q1cyqs/production/aa5fb7be691a23fefde9c5c333bc49ce179f8c9a-1920x1072.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-85 contrast-115"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent from-50% to-pri-parchment" />
        </div>
        <PriEyebrow>Outcomes Data</PriEyebrow>
        <h2 className="mb-1 font-heading text-[clamp(1.5rem,4vw,2.5rem)] text-pri-ink">Clinical Outcomes</h2>
        <p className="mb-8 text-[.82rem] text-pri-tan">Source: {OUTCOMES_SOURCE}</p>

        <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-px border border-pri-border bg-pri-border">
          {MESCALINE_OUTCOMES.map((o) => (
            <div key={o.condition} className="bg-pri-parchment px-4 py-6 text-center">
              <div className="font-heading text-[clamp(2rem,6vw,3rem)] leading-none font-black text-pri-purple">{o.improved}</div>
              <div className="mt-1 text-xs font-bold tracking-[0.08em] text-pri-tan uppercase">{o.condition} improved</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border-l-3 border-[#C9A84C] bg-pri-parchment p-5">
            <div className="mb-1 text-xs font-extrabold tracking-[0.08em] text-[#866E29] uppercase">Spiritual Significance</div>
            <div className="text-[.88rem] leading-[1.6] text-pri-brown">{OUTCOMES_SPIRITUAL}</div>
          </div>
          <div className="border-l-3 border-[#6B8F71] bg-pri-parchment p-5">
            <div className="mb-1 text-xs font-extrabold tracking-[0.08em] text-[#5A785F] uppercase">Intent Paradox</div>
            <div className="text-[.88rem] leading-[1.6] text-pri-brown">{OUTCOMES_INTENT}</div>
          </div>
        </div>
      </PriSection>

      {/* ── PHARMA → PLANT ALTERNATIVES ── */}
      <PriSection id="pharma-alternatives" dark>
        <div className="relative mb-8 h-[clamp(180px,25vw,280px)] w-full overflow-hidden rounded-md">
          <Image
            src="https://cdn.sanity.io/images/a3q1cyqs/production/037cce693c9a348f8c11a9faa3137c4a2656f2f0-1200x670.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-70 contrast-120"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent from-40% to-pri-ink" />
        </div>
        <PriEyebrow>Pharma → Plant Alternatives</PriEyebrow>
        <h2 className="mb-4 font-heading text-[clamp(1.5rem,4vw,2.5rem)] text-pri-cream">16 Medications &amp; Their Alternatives</h2>
        <div className="mb-8 border-l-4 border-[#581C87] bg-[#581C87]/15 p-5">
          <div className="mb-1 flex items-center gap-1.5 text-[.72rem] font-extrabold tracking-[0.06em] text-[#EF5350] uppercase">
            <AlertTriangle className="size-3.5" />
            Educational Only. Not Medical Advice. Not a Substitution Guide.
          </div>
          <p className="m-0 text-[.82rem] leading-[1.6] text-pri-cream/55">
            Do not stop or modify any prescribed medication based on this content. Dangerous interactions exist between plant medicines and psychiatric
            drugs. Always consult qualified healthcare professionals.
          </p>
        </div>
        <div className="bg-pri-parchment">
          <PharmaTable />
        </div>
      </PriSection>

      {/* ── SUPPLEMENT STACKS ── */}
      <PriSection id="supplements">
        <div className="relative mb-8 h-[clamp(180px,25vw,280px)] w-full overflow-hidden rounded-md">
          <Image
            src="https://cdn.sanity.io/images/a3q1cyqs/production/5fe9eaa02ef1901c720475830785db600dcf7e6a-1200x670.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-85 contrast-115"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent from-50% to-pri-parchment" />
        </div>
        <PriEyebrow>Supplement Protocol</PriEyebrow>
        <h2 className="mb-8 font-heading text-[clamp(1.5rem,4vw,2.5rem)] text-pri-ink">Preparation &amp; Integration Stack</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {SUPPLEMENT_STACKS.map((phase) => (
            <div key={phase.phase} className="border border-pri-border bg-pri-parchment">
              <div className={`px-4 py-3 ${phase.phase === "PRE" ? "bg-[#536F58]" : phase.phase === "DAY-OF" ? "bg-[#7B6425]" : "bg-pri-purple"}`}>
                <div className="text-xs font-extrabold tracking-[0.1em] text-white uppercase">{phase.phase}</div>
                <div className="text-[.78rem] text-white/90">{phase.timing}</div>
              </div>
              <div className="p-4">
                {phase.items.map((item, i) => (
                  <div key={item.name} className={`flex items-start justify-between gap-2 py-2 ${i < phase.items.length - 1 ? "border-b border-[#E8E2D8]" : ""}`}>
                    <div>
                      <div className="text-[.85rem] font-semibold text-pri-ink">{item.name}</div>
                      <div className="text-[.72rem] text-pri-tan">{item.dosage}</div>
                    </div>
                    {item.searchUrl && (
                      <a href={item.searchUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 border border-pri-purple/20 px-1.5 py-0.5 text-[.75rem] font-bold whitespace-nowrap text-pri-purple">
                        Buy
                        <ArrowRight aria-hidden="true" className="size-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PriSection>

      {/* ── PRI DIMENSION SCORES ── */}
      <PriSection id="dimensions" dark>
        <div className="relative mb-8 h-[clamp(180px,25vw,280px)] w-full overflow-hidden rounded-md">
          <Image
            src="https://cdn.sanity.io/images/a3q1cyqs/production/926fb6af7c77f618596e53305d563d47d5281d95-1920x1072.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-70 contrast-120"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent from-40% to-pri-ink" />
        </div>
        <PriEyebrow>PRI Dimension Scores</PriEyebrow>
        <h2 className="mb-8 font-heading text-[clamp(1.5rem,4vw,2.5rem)] text-pri-cream">Mescaline-Specific Readiness</h2>
        <div className="grid gap-3">
          {MESCALINE_DIM_SCORES.map((d) => (
            <div key={d.dimension} className="flex items-start gap-4 border border-pri-cream/8 bg-pri-cream/4 p-5">
              <d.icon aria-hidden="true" className="size-8 shrink-0 text-pri-purple" strokeWidth={1.5} />
              <div className="flex-1">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <div className="font-heading text-base font-bold text-pri-cream">{d.dimension}</div>
                  <span
                    className={`border px-2 py-0.5 text-xs font-extrabold tracking-[0.06em] uppercase ${
                      d.threshold === "Critical"
                        ? "border-[#581C87]/30 bg-[#581C87]/20 text-[#EF5350]"
                        : d.threshold.includes("High")
                          ? "border-[#C9A84C]/30 bg-[#C9A84C]/15 text-[#C9A84C]"
                          : "border-[#6B8F71]/30 bg-[#6B8F71]/15 text-[#81C784]"
                    }`}
                  >
                    {d.threshold}
                  </span>
                </div>
                <div className="text-[.85rem] leading-[1.6] text-pri-cream/50">{d.keyNote}</div>
              </div>
            </div>
          ))}
        </div>
      </PriSection>

      {/* ── MEDICINE SELECTOR ── */}
      <PriSection id="selector">
        <PriEyebrow>Medicine Selector</PriEyebrow>
        <h2 className="mb-6 font-heading text-[clamp(1.5rem,4vw,2.5rem)] text-pri-ink">How Mescaline Compares</h2>
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)">
          <table className="w-full min-w-187.5 border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Medicine</th>
                <th className={`${thClass} text-center`}>Dep</th>
                <th className={`${thClass} text-center`}>Anx</th>
                <th className={`${thClass} text-center`}>PTSD</th>
                <th className={`${thClass} text-center`}>Addict</th>
                <th className={thClass}>Duration</th>
                <th className={thClass}>Beginner</th>
                <th className={thClass}>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {MEDICINE_SELECTOR.map((m, i) => {
                const isMesc = m.medicine.includes("Mescaline");
                return (
                  <tr key={m.medicine} className={isMesc ? "bg-pri-purple/6" : i % 2 ? "bg-pri-parchment" : ""}>
                    <td className={`${tdClass} ${isMesc ? "font-extrabold text-pri-purple" : "font-semibold"}`}>
                      <m.icon aria-hidden="true" className="mr-1.5 inline size-4 align-[-0.15em]" />
                      {m.medicine}
                    </td>
                    <td className={`${tdClass} text-center ${m.depression === "✓" ? "text-[#3D6B44]" : "text-pri-tan"}`}>
                      <SelectorMark value={m.depression} />
                    </td>
                    <td className={`${tdClass} text-center ${m.anxiety === "✓" ? "text-[#3D6B44]" : "text-pri-tan"}`}>
                      <SelectorMark value={m.anxiety} />
                    </td>
                    <td className={`${tdClass} text-center ${m.ptsd === "✓" || m.ptsd === "Best" ? "text-[#3D6B44]" : "text-pri-tan"}`}>
                      <SelectorMark value={m.ptsd} />
                    </td>
                    <td className={`${tdClass} text-center ${m.addiction === "✓" || m.addiction === "Best" ? "text-[#3D6B44]" : "text-pri-tan"}`}>
                      <SelectorMark value={m.addiction} />
                    </td>
                    <td className={tdClass}>{m.duration}</td>
                    <td className={tdClass}>{m.beginner}</td>
                    <td className={tdClass}>
                      <span
                        className={`border px-1.5 py-0.5 text-xs font-bold ${
                          m.evidence.startsWith("Strong") ? "border-[#6B8F71]/30 bg-[#6B8F71]/15 text-[#3D6B44]" : "border-[#C9A84C]/30 bg-[#C9A84C]/15 text-[#7A5C10]"
                        }`}
                      >
                        {m.evidence}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PriSection>

      {/* ── SOURCES ── */}
      <PriSection id="sources" dark>
        <div className="relative mb-8 h-[clamp(180px,25vw,280px)] w-full overflow-hidden rounded-md">
          <Image
            src="https://cdn.sanity.io/images/a3q1cyqs/production/fbba337e52018b805d21f298be1b963d1b3510cf-1920x1072.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover brightness-70 contrast-120"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent from-40% to-pri-ink" />
        </div>
        <PriEyebrow>Sources</PriEyebrow>
        <h2 className="mb-6 font-heading text-[clamp(1.3rem,3vw,1.8rem)] text-pri-cream">Research &amp; References</h2>
        <ol className="m-0 list-decimal space-y-1.5 pl-6">
          {MESCALINE_SOURCES.map((s) => (
            <li key={s} className="text-[.85rem] leading-[1.8] text-pri-cream/50">
              {s}
            </li>
          ))}
        </ol>
      </PriSection>

      {/* ── FOOTER ── */}
      <footer className="bg-pri-ink px-5 py-12 text-center text-pri-cream/60">
        <div className="mx-auto max-w-150">
          <div className="mb-1 font-heading text-[1.3rem] text-pri-cream">
            ImpactSoul <span className="text-pri-purple">×</span> Psychedelic Readiness Index
          </div>
          <div className="mb-4 text-[.78rem]">A consciousness-aligned capital initiative</div>
          <div className="my-4 flex flex-wrap justify-center gap-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-[.72rem] font-semibold tracking-[0.06em] text-pri-cream/60 uppercase">
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              Back to PRI
            </Link>
            <a href="https://tonygreenberg.com" className="text-[.72rem] font-semibold tracking-[0.06em] text-pri-cream/60 uppercase">
              TonyGreenberg.com
            </a>
          </div>
          <div className="mt-6 border-t border-pri-cream/6 pt-5">
            <div className="mb-2 text-xs font-bold tracking-[0.08em] text-pri-purple-light uppercase">Legal Disclaimer</div>
            <div className="text-[.7rem] leading-[1.8] text-pri-cream/60">{MESCALINE_DISCLAIMER}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
