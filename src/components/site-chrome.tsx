"use client";

import { usePathname } from "next/navigation";

// /oauth is the MCP sign-in page (src/app/oauth/authorize), a focused screen an AI app opens
// mid-connection, not part of the site, so it gets no header or footer. The header and footer
// stay Server Components, passed through as children.
const SUPPRESSED_PREFIXES = ["/oauth"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (SUPPRESSED_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  return <>{children}</>;
}
