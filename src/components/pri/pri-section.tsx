// Shared light/dark section wrapper used across the PRI deep-dive modules
// (mescaline, iboga, ...) — ported from each legacy module's own local
// `Section` helper, unified here since they were all identical.
export function PriSection({ id, dark, children }: { id: string; dark?: boolean; children: React.ReactNode }) {
  return (
    <section id={id} data-dark={dark || undefined} className={`group/pri px-5 py-16 ${dark ? "bg-pri-ink text-pri-cream" : "bg-pri-cream text-pri-ink"}`}>
      <div className="mx-auto max-w-275">{children}</div>
    </section>
  );
}

// On a dark PriSection the eyebrow switches to the light purple: the regular
// one is 2:1 on pri-ink, under WCAG AA (2026-09-30 axe audit).
export function PriEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-pri-purple uppercase group-data-dark/pri:text-pri-purple-light">
      <span className="block h-0.5 w-6 bg-pri-purple group-data-dark/pri:bg-pri-purple-light" />
      {children}
    </div>
  );
}
