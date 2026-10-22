import type { MetadataRoute } from "next";
import { ALL_PAGES } from "@/lib/site-nav";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://psychedelicreadiness.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return ALL_PAGES.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
