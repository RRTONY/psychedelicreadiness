import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";
import { FOOTER_NAV } from "@/lib/site-nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-pri-cream/10 bg-pri-ink text-pri-cream print:hidden">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="inline-flex min-h-11 items-center gap-2.5">
            <LogoMark />
            <span className="font-heading text-lg font-semibold">Psychedelic Readiness</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm/relaxed text-pri-cream/60">
            An honest map of where you stand before you walk into territory that rewards preparation.
          </p>
        </div>

        {FOOTER_NAV.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="mb-3 font-mono text-[.7rem] tracking-[0.14em] text-brand-gold-light uppercase">{group.title}</h2>
            <ul className="space-y-1">
              {group.links.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex min-h-9 items-center text-sm text-pri-cream/70 hover:text-pri-cream">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-pri-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-pri-cream/55 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>For education only. Not medical advice.</p>
          <p>
            &copy; {new Date().getFullYear()} Tony Greenberg &middot;{" "}
            <a href="https://tonygreenberg.com" className="underline-offset-2 hover:text-pri-cream hover:underline">
              tonygreenberg.com
            </a>{" "}
            &middot;{" "}
            <a href="https://impactsoul.is" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-pri-cream hover:underline">
              ImpactSoul
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
