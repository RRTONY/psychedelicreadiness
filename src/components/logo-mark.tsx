import { cn } from "@/lib/utils";

// The site's mark: a readiness gauge (purple dial, gold needle). Same drawing as src/app/icon.svg,
// the browser-tab icon; keep the two in step.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="7" className="fill-pri-ink" />
      <path d="M8.6 21.6a9 9 0 1 1 14.8 0" fill="none" strokeWidth="2.6" strokeLinecap="round" className="stroke-pri-purple-light" />
      <path d="M16 17.2 21.2 11" strokeWidth="2.4" strokeLinecap="round" className="stroke-brand-gold-light" />
      <circle cx="16" cy="17.2" r="2.6" className="fill-brand-gold-light" />
    </svg>
  );
}
