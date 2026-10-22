import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Page not found | Psychedelic Readiness Index" };

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-pri-ink px-4 py-24 text-center text-pri-cream">
      <p className="font-mono text-xs tracking-[0.14em] text-brand-gold-light uppercase">404</p>
      <h1 className="mt-3 font-heading text-3xl md:text-4xl">This page isn&rsquo;t here</h1>
      <p className="mt-3 max-w-md text-pri-cream/65">The address may have changed. The Index is the best place to start.</p>
      <Link href="/" className="mt-8 inline-flex min-h-11 items-center gap-1.5 rounded-md bg-brand-gold-light px-5 text-sm font-semibold text-pri-ink">
        Go to the Index
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </Link>
    </div>
  );
}
