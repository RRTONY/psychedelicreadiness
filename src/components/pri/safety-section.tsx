import type { MedicineWithSafety } from "@/lib/content/pri-data";

// Ported from legacy's `SafetySection` — the real safety-warning,
// contraindications, drug-interactions, side-effects, and legal-status
// display for a medicine, unchanged.
export function SafetySection({ medicine }: { medicine: MedicineWithSafety }) {
  return (
    <div>
      <div className="mb-4 border-l-4 border-pri-purple bg-pri-purple/8 p-5">
        <div className="mb-1 text-xs font-extrabold tracking-[0.08em] text-pri-purple uppercase">Safety Warning</div>
        <div className="text-[.88rem] leading-[1.7] text-pri-brown">{medicine.safetyWarning}</div>
      </div>

      <div className="mt-5 mb-1 text-[.7rem] font-extrabold tracking-[0.12em] text-pri-purple uppercase">Contraindications ... Do Not Use If</div>
      <ul className="m-0 list-disc space-y-1 pl-5">
        {medicine.contraindications.map((c) => (
          <li key={c} className="text-[.88rem] leading-[1.8] text-pri-brown">
            {c}
          </li>
        ))}
      </ul>

      <div className="mt-5 mb-1 text-[.7rem] font-extrabold tracking-[0.12em] text-[#E65100] uppercase">Drug Interactions</div>
      <div className="border-l-4 border-[#E65100] bg-[#FFF3E0] p-4">
        <ul className="m-0 list-disc space-y-1 pl-4">
          {medicine.drugInteractions.map((d) => (
            <li key={d} className="text-[.85rem] leading-[1.8] text-pri-brown">
              {d}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 mb-1 text-[.7rem] font-extrabold tracking-[0.12em] text-pri-purple uppercase">Known Side Effects</div>
      <ul className="m-0 list-disc space-y-1 pl-5">
        {medicine.sideEffects.map((s) => (
          <li key={s} className="text-[.85rem] leading-[1.8] text-pri-brown">
            {s}
          </li>
        ))}
      </ul>

      <div className="mt-5 mb-1 text-[.7rem] font-extrabold tracking-[0.12em] text-pri-purple uppercase">Legal Status</div>
      <div className="bg-pri-cream p-4 text-[.88rem] leading-[1.7] text-pri-brown">{medicine.legalStatus}</div>
    </div>
  );
}
