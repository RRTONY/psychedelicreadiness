import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/logo-mark";
import { SiteMobileMenu } from "@/components/site-mobile-menu";
import { PRIMARY_NAV } from "@/lib/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 print:hidden border-b border-pri-cream/10 bg-pri-ink/95 text-pri-cream backdrop-blur supports-backdrop-filter:bg-pri-ink/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-2.5" aria-label="Psychedelic Readiness, home">
          <LogoMark />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-[1.05rem] font-semibold tracking-tight">Psychedelic Readiness</span>
            <span className="mt-1 font-mono text-[.62rem] tracking-[0.14em] text-pri-cream/55 uppercase">Know before you go</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-md px-3 text-sm text-pri-cream/75 transition-colors hover:bg-pri-cream/5 hover:text-pri-cream"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/pri-efficacy"
            className="ml-2 inline-flex min-h-10 items-center gap-1.5 rounded-md bg-brand-gold-light px-4 text-sm font-semibold text-pri-ink transition-colors hover:bg-brand-gold-light/85"
          >
            The Evidence
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </nav>

        <SiteMobileMenu />
      </div>
    </header>
  );
}
