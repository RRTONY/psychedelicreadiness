"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { FOOTER_NAV } from "@/lib/site-nav";

// Phone and tablet menu (below lg). Closes when the page changes, by adjusting state during
// render rather than in an effect (CONTRIBUTING "What NOT to Do").
export function SiteMobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex size-11 items-center justify-center rounded-md text-pri-cream hover:bg-pri-cream/5"
      >
        {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="absolute inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-pri-cream/10 bg-pri-ink px-4 pt-2 pb-6 sm:px-6"
        >
          {FOOTER_NAV.map((group) => (
            <div key={group.title} className="border-t border-pri-cream/10 py-3 first:border-t-0">
              <div className="mb-1 font-mono text-[.68rem] tracking-[0.14em] text-brand-gold-light uppercase">{group.title}</div>
              <ul>
                {group.links.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className="flex min-h-11 items-center text-base text-pri-cream/80 hover:text-pri-cream aria-[current=page]:text-pri-purple-light"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      )}
    </div>
  );
}
