import type { Metadata } from "next";
import { SITE_OPEN_GRAPH } from "@/lib/site-open-graph";
import { SitePage, SiteList, SiteParagraphs, SiteSection } from "@/components/site-page";
import { CONTACT_EMAIL, PRIVACY } from "@/lib/content/site-pages";

// How the site handles information, checked against the code (see `site-pages.ts`).
export const metadata: Metadata = {
  title: "Privacy — Psychedelic Readiness Index",
  description: "What psychedelicreadiness.com does with your information: answers stay in your browser, no cookies, no analytics, and forms email Tony only when you send them.",
  alternates: { canonical: "/privacy" },
  openGraph: { ...SITE_OPEN_GRAPH, url: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <SitePage title="Privacy">
      <p className="mb-10 leading-[1.75] text-pri-brown">{PRIVACY.intro}</p>
      {PRIVACY.sections.map((s) => (
        <SiteSection key={s.title} title={s.title}>
          <SiteParagraphs paragraphs={s.paragraphs} />
          <SiteList items={s.items} />
        </SiteSection>
      ))}
      <SiteSection title="Questions">
        <p className="mb-3 leading-[1.75] text-pri-brown">
          Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold text-pri-purple underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </SiteSection>
    </SitePage>
  );
}
