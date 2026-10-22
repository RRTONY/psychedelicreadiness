// Files the MCP server's tools may never read or write, regardless of what a
// connected AI client asks for — closes off the agent editing its own gate,
// secrets, or build config. Checked on every read/write/delete tool call.
// Mirrors tonygreenberg.com's and ramprate-ui's admin MCP servers.
const DENYLIST_PATTERNS: RegExp[] = [
  /^\.env(\..*)?$/i,
  // next.config.ts is intentionally NOT blocked: redirects live there.
  // netlify.toml, .env*, and the rest below stay blocked.
  /^package\.json$/i,
  /^pnpm-lock\.yaml$/i,
  /^pnpm-workspace\.yaml$/i,
  /^netlify\.toml$/i,
  /^\.mcp\.json$/i,
  /^\.github\//i,
  /^\.git\//i,
  // Runs on every matched request: a bad edit here takes the whole site down.
  /^src\/proxy\.ts$/i,
  /^src\/lib\/admin\//i,
  /^src\/app\/api\/mcp\//i,
  // The MCP server's own sign-in (OAuth) endpoints and page.
  /^src\/app\/api\/oauth\//i,
  /^src\/app\/oauth\//i,
  /^src\/app\/\.well-known\//i,
];

// Denylisted files that hold no secrets, so the agent may read (never write)
// them — lets a connected session see build/deploy settings for debugging
// without being able to change them.
const READ_ONLY_PATTERNS: RegExp[] = [
  /^package\.json$/i,
  /^netlify\.toml$/i,
  /^\.github\/workflows\/[^/]+\.ya?ml$/i,
  /^src\/proxy\.ts$/i,
];

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "");
}

export function isPathDenied(path: string): boolean {
  const normalized = normalizePath(path);
  return DENYLIST_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function isPathReadDenied(path: string): boolean {
  const normalized = normalizePath(path);
  return isPathDenied(normalized) && !READ_ONLY_PATTERNS.some((pattern) => pattern.test(normalized));
}

export const ADMIN_BRANCH_PREFIX = "admin/mcp-";
