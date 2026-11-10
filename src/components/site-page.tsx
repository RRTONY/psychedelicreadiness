import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LAST_REVIEWED } from "@/lib/content/site-pages";

// The frame for the plain text pages (About, Contact, Privacy, Terms, Full Disclaimer): eyebrow,
// one H1, the "last reviewed" date, the content, and a way back to the Index.
export function SitePage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-pri-parchment text-pri-ink">
      <div className="mx-auto max-w-180 px-4 pt-10 pb-16 sm:px-8 sm:pt-16">
        <p className="mb-3 text-xs font-bold tracking-[0.14em] text-pri-purple uppercase">Psychedelic Readiness Index</p>
        <h1 className="mb-3 font-heading text-4xl leading-tight font-bold sm:text-5xl">{title}</h1>
        <p className="mb-8 text-[.85rem] text-pri-tan">Last reviewed {LAST_REVIEWED}</p>
        {children}
        <Link href="/" className="mt-4 inline-flex min-h-11 items-center gap-1.5 bg-pri-purple px-6 py-3 text-sm font-bold text-pri-cream">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to the Index
        </Link>
      </div>
    </div>
  );
}

export function SiteSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-heading text-[clamp(1.2rem,3vw,1.5rem)] font-bold text-pri-purple">{title}</h2>
      {children}
    </section>
  );
}

export function SiteParagraphs({ paragraphs }: { paragraphs?: readonly string[] }) {
  return paragraphs?.map((p) => (
    <p key={p} className="mb-3 leading-[1.75] text-pri-brown">
      {p}
    </p>
  ));
}

export function SiteList({ items, ordered = false }: { items?: readonly string[]; ordered?: boolean }) {
  if (!items?.length) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <List className={`${ordered ? "list-decimal marker:font-bold" : "list-disc"} space-y-2 pl-5 leading-[1.7] text-pri-brown marker:text-pri-purple`}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </List>
  );
}
