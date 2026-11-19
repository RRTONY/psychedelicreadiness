// Google Analytics 4 switch (2026-11-20). Off unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set in
// Netlify, so turning it on is Tony's decision, made in one place. The Privacy page
// (`site-pages.ts`) reads the same switch, so its text always matches what the site does.
// Only a real GA4 id ("G-" + letters/digits) counts: the value is written into an inline script.
export function readMeasurementId(raw: string | undefined): string {
  const id = raw?.trim() ?? "";
  return /^G-[A-Z0-9]{4,20}$/.test(id) ? id : "";
}

export const GA_MEASUREMENT_ID = readMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
export const ANALYTICS_ON = GA_MEASUREMENT_ID !== "";
