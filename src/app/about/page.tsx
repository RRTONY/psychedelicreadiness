import type { Metadata } from "next";
import Link from "next/link";
import { SITE_OPEN_GRAPH } from "@/lib/site-open-graph";
import { SitePage, SiteList, SiteParagraphs, SiteSection } from "@/components/site-page";
import { DISCLAIMER_PATH, NOT_A_DOCTOR, SCORE_CAN_TELL, TONY_NOTE, WHAT_THIS_IS } from "@/lib/content/pri-disclaimer";

// About the Index, made of Tony's approved text (`pri-disclaimer.ts`), unchanged.
export const metadata: Metadata = {
  title: "About — Psychedelic Readiness Index",
  description: "Why Tony Greenberg built the Psychedelic Readiness Index, what it is and what it is not, and what a score can and cannot tell you.",
  alternates: { canonical: "/about" },
  openGraph: { ...SITE_OPEN_GRAPH, url: "/about" },
};

export default function AboutPage() {
  return (
    <SitePage title="About the Index">
      <section className="mb-10 rounded-sm border border-brand-gold/20 border-l-4 border-l-brand-gold bg-brand-gold/6 px-5 py-5">
        <h2 className="mb-3 font-heading text-[clamp(1.2rem,3vw,1.5rem)] font-bold text-pri-purple">{TONY_NOTE.title}</h2>
        <blockquote className="font-serif text-[1.02rem] leading-[1.8] text-[#3D2E1E] italic">&ldquo;{TONY_NOTE.quote}&rdquo;</blockquote>
        <p className="mt-3 text-[.85rem] font-semibold text-brand-gold">
          —{" "}
          <a href="https://tonygreenberg.com" className="underline underline-offset-2">
            {TONY_NOTE.byline}
          </a>
        </p>
      </section>
      <SiteSection title={NOT_A_DOCTOR.title}>
        <p className="mb-3 leading-[1.75] text-pri-brown">
          {NOT_A_DOCTOR.before}
          <strong>{NOT_A_DOCTOR.strong}</strong>
          {NOT_A_DOCTOR.after}
        </p>
      </SiteSection>
      <SiteSection title={WHAT_THIS_IS.title}>
        <SiteList items={WHAT_THIS_IS.items} />
      </SiteSection>
      <SiteSection title={SCORE_CAN_TELL.title}>
        <SiteParagraphs paragraphs={SCORE_CAN_TELL.paragraphs} />
      </SiteSection>
      <p className="mb-10 leading-[1.75] text-pri-brown">
        Read the{" "}
        <Link href={DISCLAIMER_PATH} className="font-bold text-pri-purple underline underline-offset-2">
          full disclaimer
        </Link>
        .
      </p>
    </SitePage>
  );
}
