// The site's pages, in the order the header, phone menu, footer and sitemap list them.
export type NavLink = { href: string; label: string };

export const PRIMARY_NAV: NavLink[] = [
  { href: "/", label: "The Index" },
  { href: "/pri-calibration", label: "Calibration" },
  { href: "/medicine-sequencing", label: "Sequencing" },
  { href: "/iboga-compass", label: "Iboga Compass" },
  { href: "/facilitator-index", label: "Facilitators" },
];

export const FOOTER_NAV: { title: string; links: NavLink[] }[] = [
  {
    title: "The Index",
    links: [
      { href: "/", label: "Psychedelic Readiness Index" },
      { href: "/pri-calibration", label: "Deep Calibration" },
      { href: "/pri-efficacy", label: "Efficacy Report" },
    ],
  },
  {
    title: "Medicines",
    links: [
      { href: "/medicine-sequencing", label: "Medicine Sequencing Ladder" },
      { href: "/iboga-ibogaine", label: "Iboga & Ibogaine" },
      { href: "/iboga-compass", label: "Iboga Compass" },
      { href: "/peyote-mescaline", label: "Peyote & Mescaline" },
    ],
  },
  {
    title: "Facilitators",
    links: [{ href: "/facilitator-index", label: "The Facilitator Index" }],
  },
];

export const ALL_PAGES: string[] = [...new Set(FOOTER_NAV.flatMap((g) => g.links.map((l) => l.href)))];
