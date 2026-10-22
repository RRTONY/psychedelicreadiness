"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { MEDICINES, type Medicine } from "@/lib/content/pri-data";

// Ported from legacy client/src/pages/MedicineSequencing.tsx's filter row +
// grouped medicine cards. Each card's detail panel uses `forceMount` — same
// crawlability rule as /journeys, /intel and /framework: overview/readiness
// text is real content, so it has to be in the raw SSR HTML before a click.
// The level filter hides (not unmounts) non-matching rungs for the same
// reason.

export const COMPLEXITY_ORDER = [
  "Entry",
  "Beginner",
  "Intermediate",
  "Advanced",
  "Clinical Only",
  "Hard Stop",
] as const;

type Level = (typeof COMPLEXITY_ORDER)[number];

// Legacy treated a missing complexityLevel as "Intermediate" — preserved.
export function levelOf(m: Medicine): Level {
  const level = m.complexityLevel ?? "Intermediate";
  return (COMPLEXITY_ORDER as readonly string[]).includes(level) ? (level as Level) : "Intermediate";
}

const COMPLEXITY_DESCRIPTIONS: Record<Level, string> = {
  Entry: "Gentle altered states. No hallucinations. Legal in most places. Ideal starting point for those new to non-ordinary consciousness.",
  Beginner: "Mild to moderate altered states. Short duration. Relatively forgiving. Some prior experience helpful but not required.",
  Intermediate: "Significant altered states. 4–12 hours. Prior psychedelic experience strongly recommended. Requires preparation and support.",
  Advanced: "Profound altered states. Ego dissolution possible. Clinical or experienced facilitation required. Not for the unprepared.",
  "Clinical Only": "Pharmaceutical-grade compounds in FDA-approved or clinical trial settings only. Not available outside supervised medical protocols.",
  "Hard Stop": "NOT psychedelics. Anticholinergic deliriants that produce genuine delirium. No therapeutic application. Listed to protect you.",
};

// One full literal class string per level/variant (Tailwind needs the
// complete string in source — see CONTRIBUTING.md's dynamic-classes rule).
const LEVEL_STYLES: Record<
  Level,
  { header: string; badge: string; text: string; filterIdle: string; filterActive: string; cardOpen: string; bar: string }
> = {
  Entry: {
    header: "border-[#86efac] bg-[#f0fdf4]/95",
    badge: "bg-[#16a34a]",
    text: "text-[#14532d]",
    filterIdle: "border-[#86efac] bg-white/80 text-[#14532d]",
    filterActive: "border-[#86efac] bg-[#16a34a] text-white",
    cardOpen: "data-[state=open]:border-[#86efac] data-[state=open]:bg-[#f0fdf4]/95",
    bar: "bg-[#16a34a]",
  },
  Beginner: {
    header: "border-[#7dd3fc] bg-[#f0f9ff]/95",
    badge: "bg-[#0284c7]",
    text: "text-[#0c4a6e]",
    filterIdle: "border-[#7dd3fc] bg-white/80 text-[#0c4a6e]",
    filterActive: "border-[#7dd3fc] bg-[#0284c7] text-white",
    cardOpen: "data-[state=open]:border-[#7dd3fc] data-[state=open]:bg-[#f0f9ff]/95",
    bar: "bg-[#0284c7]",
  },
  Intermediate: {
    header: "border-[#fde047] bg-[#fefce8]/95",
    badge: "bg-[#ca8a04]",
    text: "text-[#713f12]",
    filterIdle: "border-[#fde047] bg-white/80 text-[#713f12]",
    filterActive: "border-[#fde047] bg-[#ca8a04] text-white",
    cardOpen: "data-[state=open]:border-[#fde047] data-[state=open]:bg-[#fefce8]/95",
    bar: "bg-[#ca8a04]",
  },
  Advanced: {
    header: "border-[#fdba74] bg-[#fff7ed]/95",
    badge: "bg-[#ea580c]",
    text: "text-[#7c2d12]",
    filterIdle: "border-[#fdba74] bg-white/80 text-[#7c2d12]",
    filterActive: "border-[#fdba74] bg-[#ea580c] text-white",
    cardOpen: "data-[state=open]:border-[#fdba74] data-[state=open]:bg-[#fff7ed]/95",
    bar: "bg-[#ea580c]",
  },
  "Clinical Only": {
    header: "border-[#c4b5fd] bg-[#f5f3ff]/95",
    badge: "bg-[#7c3aed]",
    text: "text-[#3b0764]",
    filterIdle: "border-[#c4b5fd] bg-white/80 text-[#3b0764]",
    filterActive: "border-[#c4b5fd] bg-[#7c3aed] text-white",
    cardOpen: "data-[state=open]:border-[#c4b5fd] data-[state=open]:bg-[#f5f3ff]/95",
    bar: "bg-[#7c3aed]",
  },
  "Hard Stop": {
    header: "border-[#fca5a5] bg-[#fef2f2]/95",
    badge: "bg-[#dc2626]",
    text: "text-[#7f1d1d]",
    filterIdle: "border-[#fca5a5] bg-white/80 text-[#7f1d1d]",
    filterActive: "border-[#fca5a5] bg-[#dc2626] text-white",
    cardOpen: "data-[state=open]:border-[#fca5a5] data-[state=open]:bg-[#fef2f2]/95",
    bar: "bg-[#dc2626]",
  },
};

const FILTER_BASE =
  "rounded-full border-2 px-4 py-1.5 font-mono text-xs font-semibold tracking-wide transition-colors sm:text-sm";

function MedicineCard({ med, level }: { med: Medicine; level: Level }) {
  const s = LEVEL_STYLES[level];
  return (
    <Collapsible
      className={cn(
        "group mb-3 overflow-hidden rounded-xl border border-black/8 bg-white/85 backdrop-blur-sm transition-colors",
        s.cardOpen,
      )}
    >
      <CollapsibleTrigger className="flex w-full items-center gap-4 px-4 py-3 text-left sm:px-5 sm:py-4">
        <med.icon aria-hidden="true" className="size-6 shrink-0 text-facilitator-ink/70 sm:size-7" />
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 font-heading text-base font-bold text-facilitator-ink sm:text-lg">{med.name}</div>
          <div className="text-xs text-[#7A6050] italic sm:text-sm">{med.latin}</div>
        </div>
        <div
          className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-black/10"
          role="img"
          aria-label={`Intensity ${Math.round(med.intensity * 100)} of 100`}
        >
          {/* Width is per-medicine data — the one legitimate `style` exception. */}
          <div className={cn("h-full rounded-full", s.bar)} style={{ width: `${med.intensity * 100}%` }} />
        </div>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-facilitator-amber-deep transition-transform group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>

      <CollapsibleContent forceMount className="data-[state=closed]:hidden">
        <div className="border-t border-black/6 px-4 pt-3 pb-4 sm:px-5 sm:pb-5">
          {med.complexityJustification && (
            <div className="mb-3 rounded-lg border border-facilitator-amber-deep/20 bg-facilitator-amber-deep/6 px-4 py-3">
              <div className="mb-1 font-mono text-[0.7rem] tracking-widest text-facilitator-amber-deep uppercase">
                Why this rung
              </div>
              <p className="text-sm leading-relaxed text-[#4A3728] italic sm:text-base">{med.complexityJustification}</p>
            </div>
          )}
          {(
            [
              ["Overview", med.overview],
              ["Therapeutic Applications", med.therapeutic],
              ["Readiness Requirements", med.readiness],
              ["Tradition", med.tradition],
            ] as const
          ).map(([label, text]) => (
            <div key={label} className="mb-3 last:mb-0">
              <div className="mb-1 font-mono text-[0.7rem] tracking-widest text-facilitator-amber-deep uppercase">
                {label}
              </div>
              <p className="text-sm leading-relaxed text-[#3D2B1F] sm:text-base">{text}</p>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Reads MEDICINES itself rather than taking them as a prop: each medicine's
// `icon` is a lucide component, and a component can't be passed from a Server
// Component page into this Client Component.
export function MedicineSequencingLadder() {
  const medicines = MEDICINES;
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  // Sorted by rung, then by intensity within a rung — same order as legacy.
  const sorted = [...medicines].sort((a, b) => {
    const diff = COMPLEXITY_ORDER.indexOf(levelOf(a)) - COMPLEXITY_ORDER.indexOf(levelOf(b));
    return diff !== 0 ? diff : a.intensity - b.intensity;
  });

  return (
    <>
      <div className="mx-auto mb-10 flex max-w-225 flex-wrap gap-2 px-4 sm:px-12">
        <button
          type="button"
          aria-pressed={selectedLevel === null}
          onClick={() => setSelectedLevel(null)}
          className={cn(
            FILTER_BASE,
            "border-facilitator-amber-deep",
            selectedLevel === null ? "bg-facilitator-amber-deep text-white" : "bg-white/80 text-facilitator-amber-deep",
          )}
        >
          All ({medicines.length})
        </button>
        {COMPLEXITY_ORDER.map((level) => {
          const count = sorted.filter((m) => levelOf(m) === level).length;
          if (count === 0) return null;
          const active = selectedLevel === level;
          return (
            <button
              key={level}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedLevel(active ? null : level)}
              className={cn(FILTER_BASE, active ? LEVEL_STYLES[level].filterActive : LEVEL_STYLES[level].filterIdle)}
            >
              {level} ({count})
            </button>
          );
        })}
      </div>

      <div className="mx-auto max-w-225 px-4 sm:px-12">
        {COMPLEXITY_ORDER.map((level) => {
          const group = sorted.filter((m) => levelOf(m) === level);
          if (group.length === 0) return null;
          const s = LEVEL_STYLES[level];
          return (
            <section
              key={level}
              aria-label={`${level} rung`}
              className={cn("mb-12", selectedLevel !== null && selectedLevel !== level && "hidden")}
            >
              <div className={cn("mb-4 flex flex-col gap-3 rounded-xl border px-5 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-4", s.header)}>
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full px-3 py-1 font-mono text-xs font-bold tracking-wider whitespace-nowrap text-white",
                    s.badge,
                  )}
                >
                  {level}
                </span>
                <p className={cn("text-sm leading-normal sm:text-base", s.text)}>{COMPLEXITY_DESCRIPTIONS[level]}</p>
              </div>
              {group.map((med) => (
                <MedicineCard key={med.id} med={med} level={level} />
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
