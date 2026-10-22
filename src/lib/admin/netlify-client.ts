// Read-only view of psychedelicreadiness.com's Netlify deploys (live site and
// per-change previews), so a connected AI can say in plain words whether a
// build is running, live, or failed and why. Ported from ramprate-ui's
// netlify-client.ts via tonygreenberg.com. Plain fetch, no SDK. The site id
// comes from the server's environment, never from a caller, and only GET requests are made: the
// token (NETLIFY_AUTH_TOKEN) can reach every site on the account, so this
// module deliberately exposes nothing that changes or touches other sites.
import { netlifySiteName } from "@/lib/admin/site-config";

// NETLIFY_SITE_ID, or SITE_ID, which Netlify sets itself on the deployed site.
function siteId(): string {
  return process.env.NETLIFY_SITE_ID || process.env.SITE_ID || "";
}
const SITE_NAME = netlifySiteName();
const API = "https://api.netlify.com/api/v1";

export function isNetlifyConfigured(): boolean {
  return !!process.env.NETLIFY_AUTH_TOKEN && !!siteId();
}

interface RawDeploy {
  id: string;
  state: string;
  context: string;
  branch: string | null;
  created_at: string;
  published_at: string | null;
  deploy_time: number | null;
  error_message: string | null;
  deploy_ssl_url: string | null;
  commit_ref: string | null;
  title: string | null;
  skipped: boolean | null;
}

export interface DeploySummary {
  state: string;
  plain: string;
  context: string;
  branch: string | null;
  startedAt: string;
  publishedAt: string | null;
  seconds: number | null;
  error: string | null;
  url: string | null;
  logUrl: string;
  commit: string | null;
}

const STATE_WORDS: Record<string, string> = {
  ready: "Built and online.",
  error: "The build failed.",
  building: "Building now.",
  enqueued: "Waiting to build.",
  new: "Waiting to build.",
  processing: "Finishing up.",
  uploading: "Finishing up.",
  prepared: "Finishing up.",
};

export function summarizeDeploy(d: RawDeploy): DeploySummary {
  return {
    state: d.state,
    plain: STATE_WORDS[d.state] ?? d.state,
    context: d.context,
    branch: d.branch,
    startedAt: d.created_at,
    publishedAt: d.published_at,
    seconds: d.deploy_time,
    error: d.error_message || null,
    url: d.deploy_ssl_url,
    logUrl: `https://app.netlify.com/sites/${SITE_NAME}/deploys/${d.id}`,
    commit: d.commit_ref ? d.commit_ref.slice(0, 7) : null,
  };
}

// Netlify records a "Skipped" error deploy when a duplicate build of the
// same commit is cancelled. Not a real failure, so it is left out.
export function isSkippedDuplicate(d: RawDeploy): boolean {
  return !!d.skipped || (d.state === "error" && /skipped/i.test(d.error_message ?? ""));
}

export async function listDeploys(opts: {
  branch?: string;
  production?: boolean;
  limit?: number;
}): Promise<DeploySummary[]> {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (!token) throw new Error("NETLIFY_AUTH_TOKEN is not set");
  const params = new URLSearchParams({ per_page: "50" });
  if (opts.branch) params.set("branch", opts.branch);
  if (opts.production) params.set("production", "true");
  const res = await fetch(`${API}/sites/${siteId()}/deploys?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Netlify deploys request failed (${res.status})`);
  }
  const deploys = (await res.json()) as RawDeploy[];
  return deploys
    .filter((d) => !isSkippedDuplicate(d))
    .slice(0, Math.min(Math.max(opts.limit ?? 5, 1), 20))
    .map(summarizeDeploy);
}
