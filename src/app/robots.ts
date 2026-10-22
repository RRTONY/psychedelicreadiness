import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://psychedelicreadiness.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/oauth/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
