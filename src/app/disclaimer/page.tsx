import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  ACKNOWLEDGE,
  CLOSING,
  COUNCIL_REMINDER,
  DISCLAIMER_PATH,
  LEGAL,
  NOT_A_DOCTOR,
  SCORE_CAN_TELL,
  TONY_NOTE,
  WHAT_THIS_IS,
} from "@/lib/content/pri-disclaimer";

// The full PRI disclaimer (owner-approved 2026-11-11, PRI scoring review of 7 Nov 2026). The
// council reminder on the assessment, medicine profiles and printed report links here. Same text
// as the consent pop-up, read from `src/lib/content/pri-disclaimer.ts`.
export const metadata: Metadata = {
  title: "Full Disclaimer — Psychedelic Readiness Index",
  description:
    "What the Psychedelic Readiness Index can and cannot tell you, a note from Tony Greenberg, and the full legal disclaimer. No medical clearance: review personal risks with a licensed clinician.",
  alternates: { canonical: DISCLAIMER_PATH },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 font-heading text-[clamp(1.2rem,3vw,1.5rem)] font-bold text-pri-purple">{children}</h2>;
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-pri-parchment text-pri-ink">
      <div className="mx-auto max-w-180 px-4 pt-10 pb-16 sm:px-8 sm:pt-16">
        <p className="mb-3 text-xs font-bold tracking-[0.14em] text-pri-purple uppercase">Psychedelic Readiness Index</p>
        <h1 className="mb-6 font-heading text-4xl leading-tight font-bold sm:text-5xl">Full Disclaimer</h1>

        <div className="mb-10 border-l-4 border-pri-purple bg-pri-purple/8 px-5 py-4">
          <p className="mb-1 text-lg font-bold text-pri-purple">{COUNCIL_REMINDER.title}</p>
          <p className="text-[.95rem] leading-[1.6] text-pri-brown">{COUNCIL_REMINDER.body}</p>
        </div>

        <section className="mb-10">
          <SectionTitle>{SCORE_CAN_TELL.title}</SectionTitle>
          {SCORE_CAN_TELL.paragraphs.map((p) => (
            <p key={p} className="mb-3 leading-[1.75] text-pri-brown">
              {p}
            </p>
          ))}
        </section>

        <section className="mb-10 rounded-sm border border-brand-gold/20 border-l-4 border-l-brand-gold bg-brand-gold/6 px-5 py-5">
          <SectionTitle>{TONY_NOTE.title}</SectionTitle>
          <blockquote className="font-serif text-[1.02rem] leading-[1.8] text-[#3D2E1E] italic">&ldquo;{TONY_NOTE.quote}&rdquo;</blockquote>
          <p className="mt-3 text-[.85rem] font-semibold text-brand-gold">— {TONY_NOTE.byline}</p>
        </section>

        <section className="mb-10">
          <SectionTitle>{NOT_A_DOCTOR.title}</SectionTitle>
          <p className="leading-[1.75] text-pri-brown">
            {NOT_A_DOCTOR.before}
            <strong>{NOT_A_DOCTOR.strong}</strong>
            {NOT_A_DOCTOR.after}
          </p>
        </section>

        <section className="mb-10">
          <SectionTitle>{WHAT_THIS_IS.title}</SectionTitle>
          <ul className="list-disc space-y-2 pl-5 leading-[1.7] text-pri-brown marker:text-pri-purple">
            {WHAT_THIS_IS.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <SectionTitle>{ACKNOWLEDGE.title}</SectionTitle>
          <ol className="list-decimal space-y-2 pl-5 leading-[1.7] text-pri-brown marker:font-bold marker:text-pri-purple">
            {ACKNOWLEDGE.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="mb-10">
          <SectionTitle>{LEGAL.title}</SectionTitle>
          {LEGAL.paragraphs.map((p) => (
            <p key={p} className="mb-3 leading-[1.75] text-pri-brown">
              {p}
            </p>
          ))}
        </section>

        <p className="mb-10 leading-[1.75] text-pri-tan italic">{CLOSING}</p>

        <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 bg-pri-purple px-6 py-3 text-sm font-bold text-pri-cream">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to the Index
        </Link>
      </div>
    </div>
  );
}
