import type { Metadata } from "next";
import Link from "next/link";
import { SITE_OPEN_GRAPH } from "@/lib/site-open-graph";
import { SitePage, SiteList, SiteParagraphs, SiteSection } from "@/components/site-page";
import { ACKNOWLEDGE, DISCLAIMER_PATH, LEGAL, SCORE_CAN_TELL } from "@/lib/content/pri-disclaimer";

// The terms of use, made of Tony's approved disclaimer text (`pri-disclaimer.ts`), unchanged.
export const metadata: Metadata = {
  title: "Terms of Use — Psychedelic Readiness Index",
  description: "The terms for using the Psychedelic Readiness Index: education and harm reduction only, no medical advice, no endorsements, and your own responsibility.",
  alternates: { canonical: "/terms" },
  openGraph: { ...SITE_OPEN_GRAPH, url: "/terms" },
};

export default function TermsPage() {
  return (
    <SitePage title="Terms of Use">
      <SiteSection title={ACKNOWLEDGE.title}>
        <SiteList items={ACKNOWLEDGE.items} ordered />
      </SiteSection>
      <SiteSection title={SCORE_CAN_TELL.title}>
        <SiteParagraphs paragraphs={SCORE_CAN_TELL.paragraphs} />
      </SiteSection>
      <SiteSection title={LEGAL.title}>
        <SiteParagraphs paragraphs={LEGAL.paragraphs} />
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
