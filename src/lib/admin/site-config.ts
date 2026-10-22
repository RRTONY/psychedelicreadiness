// Which site, repository and Netlify project the MCP server works on. Read
// only from the server's own environment, never from a tool's input, so a
// prompt-injected instruction can't point a write at another repository.

export const SITE_DOMAIN = "psychedelicreadiness.com";
export const SITE_ORIGIN = `https://${SITE_DOMAIN}`;
export const SERVER_NAME = "psychedelicreadiness";

const DEFAULT_REPO = "RRTONY/psychedelicreadiness";
const DEFAULT_NETLIFY_SITE = "psychedelicreadiness";

// GITHUB_REPO as "owner/repo". Anything malformed falls back to the default
// rather than guessing.
export function githubRepo(): { owner: string; repo: string } {
  const raw = (process.env.GITHUB_REPO || DEFAULT_REPO).trim();
  const m = /^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)$/.exec(raw);
  const [owner, repo] = m ? [m[1], m[2]] : DEFAULT_REPO.split("/");
  return { owner, repo };
}

// The Netlify project's name: deploy previews live at
// deploy-preview-<N>--<name>.netlify.app and its GitHub check runs end in
// " - <name>".
export function netlifySiteName(): string {
  const raw = (process.env.NETLIFY_SITE_NAME || DEFAULT_NETLIFY_SITE).trim();
  return /^[a-z0-9-]+$/.test(raw) ? raw : DEFAULT_NETLIFY_SITE;
}

export function previewUrlFor(prNumber: number): string {
  return `https://deploy-preview-${prNumber}--${netlifySiteName()}.netlify.app`;
}

// The public site the read-only SEO check looks at. Until the
// domain points at Netlify, set MCP_SITE_ORIGIN to the Netlify URL.
export function siteOrigin(): string {
  return (process.env.MCP_SITE_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || SITE_ORIGIN).replace(/\/+$/, "");
}
