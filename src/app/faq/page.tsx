import type { Metadata } from "next";
import Link from "next/link";
import { SITE_OPEN_GRAPH } from "@/lib/site-open-graph";
import { SitePage } from "@/components/site-page";
import { FAQ } from "@/lib/content/faq";

export const metadata: Metadata = {
  title: "FAQ — Psychedelic Readiness Index",
  description: "Answers about the Psychedelic Readiness Index: what the score means, why a score can be paused, whether answers are stored, and how to save results.",
  alternates: { canonical: "/faq" },
  openGraph: { ...SITE_OPEN_GRAPH, url: "/faq" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
};

export default function FaqPage() {
  return (
    <SitePage title="Frequently Asked Questions">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <div className="mb-10 divide-y divide-pri-border border-y border-pri-border">
        {FAQ.map((f) => (
          <section key={f.question} className="py-6">
            <h2 className="mb-2 font-heading text-[clamp(1.1rem,3vw,1.35rem)] font-bold text-pri-purple">{f.question}</h2>
            <p className="leading-[1.75] text-pri-brown">{f.answer}</p>
          </section>
        ))}
      </div>
      <p className="mb-10 leading-[1.75] text-pri-brown">
        More on the{" "}
        <Link href="/privacy" className="font-bold text-pri-purple underline underline-offset-2">
          Privacy
        </Link>
        ,{" "}
        <Link href="/contact" className="font-bold text-pri-purple underline underline-offset-2">
          Contact
        </Link>{" "}
        and{" "}
        <Link href="/disclaimer" className="font-bold text-pri-purple underline underline-offset-2">
          Full Disclaimer
        </Link>{" "}
        pages.
      </p>
    </SitePage>
  );
}
