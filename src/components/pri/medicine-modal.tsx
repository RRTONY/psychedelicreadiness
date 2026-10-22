"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, ArrowRight, Heart, X } from "lucide-react";
import type { MedicineWithSafety } from "@/lib/content/pri-data";
import { MEDICINE_IMAGES } from "@/lib/content/pri-medicine-images";
import { TAG_CLASS, DEFAULT_TAG_CLASS } from "@/lib/content/pri-shared";
import { SafetySection } from "@/components/pri/safety-section";
import { CorrectionForm } from "@/components/pri/correction-form";

const TABS = [
  { key: "info" as const, label: "Overview" },
  { key: "safety" as const, label: "Safety & Risks" },
  { key: "correct" as const, label: "Suggest Correction" },
];

// Ported from legacy's `MedicineModal` — the real per-medicine detail modal
// (overview/safety/correction tabs, cost & access grid, deep-dive links for
// iboga/ibogaine/mescaline/ketamine, save/bookmark toggle), unchanged.
// Legacy's glitch scanline overlay div (pure decoration) is dropped, same
// call made throughout this migration.
export function MedicineModal({
  medicine,
  onClose,
  isSaved,
  onToggleSaved,
}: {
  medicine: MedicineWithSafety;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSaved?: (id: string) => void;
}) {
  const [tab, setTab] = useState<"info" | "safety" | "correct">("info");
  const heroImage = MEDICINE_IMAGES[medicine.id];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-200 flex items-center justify-center bg-pri-ink/88 p-4 backdrop-blur-sm"
    >
      <div className="relative max-h-[90vh] w-full max-w-160 overflow-y-auto bg-pri-parchment">
        <div className="absolute top-3 right-3 z-10 flex gap-1.5">
          {onToggleSaved && (
            <button
              onClick={() => onToggleSaved(medicine.id)}
              title={isSaved ? "Remove from saved" : "Save medicine"}
              className={`flex size-8 items-center justify-center rounded-full text-base text-pri-cream ${isSaved ? "bg-pri-purple" : "bg-pri-ink/60"}`}
            >
              <Heart className="size-4" fill={isSaved ? "currentColor" : "none"} />
            </button>
          )}
          <button onClick={onClose} aria-label="Close" className="flex size-8 items-center justify-center rounded-full bg-pri-ink/60 text-lg text-pri-cream">
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        {heroImage && (
          <div className="relative h-50 w-full overflow-hidden">
            <Image src={heroImage} alt="" fill sizes="(max-width: 640px) 100vw, 600px" className="object-cover object-[center_30%]" />
            <div className="absolute inset-0 bg-linear-to-b from-transparent from-40% to-pri-parchment" />
          </div>
        )}

        <div className={`relative ${heroImage ? "-mt-8 px-8" : "px-8 pt-8"}`}>
          <medicine.icon aria-hidden="true" className="mb-2 size-9 text-pri-purple" />
          <div className="font-heading text-[clamp(1.4rem,4vw,1.8rem)] text-pri-ink">{medicine.name}</div>
          <div className="mb-4 text-[.82rem] text-pri-tan italic">{medicine.latin}</div>

          <div className="mb-4 flex items-center gap-3">
            <div className="min-w-14 text-xs font-bold tracking-[0.06em] text-pri-tan uppercase">Intensity</div>
            <div className="h-1 flex-1 bg-pri-border">
              <div
                className={`h-full ${medicine.intensity > 0.8 ? "bg-pri-purple" : medicine.intensity > 0.5 ? "bg-pri-purple-mid" : "bg-[#6B8F71]"}`}
                style={{ width: `${medicine.intensity * 100}%` }}
              />
            </div>
            <div className="text-[.78rem] font-bold text-pri-ink">{Math.round(medicine.intensity * 100)}%</div>
          </div>

          <div className="mb-4 flex flex-wrap gap-1">
            {medicine.tags.map((t) => (
              <span key={t} className={`border px-1.5 py-0.5 text-xs font-bold tracking-[0.06em] uppercase ${TAG_CLASS[t] ?? DEFAULT_TAG_CLASS}`}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex border-b-2 border-pri-border px-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-0.5 flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-bold tracking-[0.06em] uppercase transition-colors ${tab === t.key ? "border-pri-purple text-pri-purple" : "border-transparent text-pri-tan"}`}
            >
              {t.key === "safety" && <AlertTriangle className="size-3.5" />}
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-8 py-6">
          {tab === "info" && (
            <>
              <div className="mt-5 mb-1 text-[.7rem] font-extrabold tracking-[0.12em] text-pri-purple uppercase">Overview</div>
              <div className="text-[.9rem] leading-[1.7] text-pri-brown">{medicine.overview}</div>

              <div className="mt-5 mb-1 text-[.7rem] font-extrabold tracking-[0.12em] text-pri-purple uppercase">Therapeutic Applications</div>
              <div className="text-[.9rem] leading-[1.7] text-pri-brown">{medicine.therapeutic}</div>

              <div className="mt-5 mb-1 text-[.7rem] font-extrabold tracking-[0.12em] text-pri-purple uppercase">Tradition</div>
              <div className="text-[.9rem] leading-[1.7] text-pri-brown">{medicine.tradition}</div>

              <div className="mt-5 mb-1 text-[.7rem] font-extrabold tracking-[0.12em] text-pri-purple uppercase">Readiness Requirements</div>
              <div className="text-[.9rem] leading-[1.7] text-pri-brown">{medicine.readiness}</div>

              <div className="mt-5 mb-1 text-[.7rem] font-extrabold tracking-[0.12em] text-pri-purple uppercase">Cost &amp; Access (USD)</div>
              <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-px bg-pri-border">
                {medicine.pricing.map((p) => (
                  <div key={p.label} className="bg-pri-cream p-3.5 text-center">
                    <div className="font-heading text-base font-bold text-pri-ink">{p.amount}</div>
                    <div className="text-[.62rem] font-semibold tracking-[0.06em] text-pri-tan uppercase">{p.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[.78rem] text-pri-tan">{medicine.providers}</div>

              {(medicine.id === "iboga" || medicine.id === "ibogaine") && (
                <div className="mt-6 bg-pri-ink p-6">
                  <div className="mb-1 text-xs font-extrabold tracking-[0.1em] text-pri-purple-light uppercase">Deep Dive Available</div>
                  <div className="mb-3 text-[.85rem] leading-[1.6] text-pri-cream/60">
                    The Plant vs The Isolate. Full alkaloid profiles, receptor pharmacology, Bwiti tradition vs clinical protocol, outcomes data, pharma
                    alternatives, supplement stacks, and medicine selector.
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/iboga-ibogaine" className="inline-flex items-center gap-2 bg-pri-purple px-5 py-2.5 text-[.78rem] font-bold tracking-[0.06em] text-pri-cream uppercase">
                      Iboga vs Ibogaine Deep Dive
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                    </Link>
                    <Link href="/iboga-compass" className="inline-flex items-center gap-2 bg-linear-to-br from-pri-purple to-pri-purple-mid px-5 py-2.5 text-[.78rem] font-bold tracking-[0.06em] text-pri-cream uppercase">
                      Take the Compass
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                    </Link>
                  </div>
                </div>
              )}
              {medicine.id === "mescaline" && (
                <div className="mt-6 bg-pri-ink p-6">
                  <div className="mb-1 text-xs font-extrabold tracking-[0.1em] text-pri-purple-light uppercase">Deep Dive Available</div>
                  <div className="mb-3 text-[.85rem] leading-[1.6] text-pri-cream/60">
                    Full pharmacology, Latuda mirror comparison, outcomes data (n=452), pharma-to-plant alternatives table, supplement stacks, and medicine
                    selector.
                  </div>
                  <Link href="/peyote-mescaline" className="inline-flex items-center gap-2 bg-pri-purple px-5 py-2.5 text-[.78rem] font-bold tracking-[0.06em] text-pri-cream uppercase">
                    Explore Full Module
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </div>
              )}
              <div className="mt-6 border-l-4 border-[#E65100] bg-[#FFF3E0] p-4">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-extrabold tracking-[0.06em] text-[#E65100] uppercase">
                  <AlertTriangle className="size-3.5" />
                  Review Safety Data Before Proceeding
                </div>
                <p className="m-0 text-[.82rem] text-pri-brown">
                  This medicine has {medicine.contraindications.length} contraindications and {medicine.drugInteractions.length} known drug interactions.{" "}
                  <button onClick={() => setTab("safety")} className="inline-flex items-center gap-1 p-0 font-bold text-pri-purple underline">
                    View Safety &amp; Risks tab
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </button>
                </p>
              </div>
            </>
          )}

          {tab === "safety" && <SafetySection medicine={medicine} />}

          {tab === "correct" && <CorrectionForm medicine={medicine} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}
