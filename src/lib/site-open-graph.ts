// The share-card settings every page uses. Next.js merges metadata shallowly, so a page that sets
// its own `openGraph` (to add its og:url) spreads these in to keep og:type, og:site_name and
// og:locale. Every page sets `openGraph: { ...SITE_OPEN_GRAPH, url: <its canonical> }`.
export const SITE_OPEN_GRAPH = { type: "website", siteName: "Psychedelic Readiness Index", locale: "en_US" } as const;
