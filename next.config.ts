import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The MCP server's check_code_quality tool runs ESLint programmatically (src/lib/admin/code-check.ts).
  // ESLint's dynamic requires aren't followed by Next's file tracing, so these stay external
  // node_modules packages (same as tonygreenberg.com).
  serverExternalPackages: ["eslint", "eslint-config-next"],
  async headers() {
    return [
      // Baseline security headers (copied from tonygreenberg.com, which explains why the CSP is
      // not a script allowlist: that would need a per-request nonce and make every page dynamic).
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "object-src 'none'; base-uri 'self'; frame-ancestors 'self'" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
      // Keep the Netlify copies (main *.netlify.app URL and deploy previews) out of search results.
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<host>.+)\\.netlify\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return [
      // The Index is this site's homepage; its tonygreenberg.com address still works here.
      { source: "/psychedelic-readiness-index", destination: "/", permanent: true },
      { source: "/pri", destination: "/", permanent: true },
    ];
  },
  images: {
    // Images are resized by Sanity's own image CDN, not /_next/image; see the loader.
    loader: "custom",
    loaderFile: "./src/lib/images/image-loader.ts",
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/a3q1cyqs/**" }],
  },
};

export default nextConfig;
