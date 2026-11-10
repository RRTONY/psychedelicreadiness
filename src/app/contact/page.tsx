import type { Metadata } from "next";
import { SITE_OPEN_GRAPH } from "@/lib/site-open-graph";
import { SitePage, SiteSection } from "@/components/site-page";
import { CONTACT, CONTACT_EMAIL } from "@/lib/content/site-pages";
import { COUNCIL_REMINDER } from "@/lib/content/pri-disclaimer";
import { CRISIS_RESOURCES } from "@/lib/content/pri-data";

export const metadata: Metadata = {
  title: "Contact — Psychedelic Readiness Index",
  description: "Contact Tony Greenberg about the Psychedelic Readiness Index, suggest a correction to a medicine's data, or find crisis support lines.",
  alternates: { canonical: "/contact" },
  openGraph: { ...SITE_OPEN_GRAPH, url: "/contact" },
};

export default function ContactPage() {
  return (
    <SitePage title="Contact">
      <SiteSection title="Email">
        <p className="mb-3 leading-[1.75] text-pri-brown">{CONTACT.intro}</p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex min-h-11 items-center text-lg font-bold text-pri-purple underline underline-offset-2">
          {CONTACT_EMAIL}
        </a>
      </SiteSection>
      <SiteSection title="Corrections">
        <p className="mb-3 leading-[1.75] text-pri-brown">{CONTACT.correction}</p>
      </SiteSection>
      <SiteSection title={CONTACT.crisisTitle}>
        <p className="mb-3 leading-[1.75] text-pri-brown">{CONTACT.crisisIntro}</p>
        <ul className="space-y-2">
          {CRISIS_RESOURCES.map((r) => (
            <li key={r.name} className="border-l-4 border-pri-purple bg-pri-purple/6 px-4 py-3">
              <span className="block font-bold text-pri-ink">{r.name}</span>
              <span className="text-pri-brown">{r.contact}</span>
            </li>
          ))}
        </ul>
      </SiteSection>
      <div className="mb-10 border-l-4 border-pri-purple bg-pri-purple/8 px-5 py-4">
        <p className="mb-1 font-bold text-pri-purple">{COUNCIL_REMINDER.title}</p>
        <p className="text-[.95rem] leading-[1.6] text-pri-brown">{COUNCIL_REMINDER.body}</p>
      </div>
    </SitePage>
  );
}
