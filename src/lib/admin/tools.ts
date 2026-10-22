import * as gh from "@/lib/admin/github-client";
import { isPathDenied, isPathReadDenied } from "@/lib/admin/guardrails";
import { checkPageSeo } from "@/lib/admin/seo-check";
import { checkCode } from "@/lib/admin/code-check";
import {
  checkFileMatchesPath,
  OPENAI_FILE_SCHEMA,
  resolveBinaryInput,
} from "@/lib/admin/binary-upload";
// Core tool set ported from tonygreenberg.com's MCP server (itself from
// ramprate-ui): repo file tools (always on an admin/mcp-* branch, never the
// default branch) and checks. This site has no CMS, so there are no content
// (Sanity) tools: every edit is a code edit. Left out on purpose (owner,
// 2026-10-23), portable from tonygreenberg.com later: the Google tools
// (Lighthouse, GA4, Search Console), send_email / create_report, and ClickUp.
// ramprate's get_attachment / create_download are not ported either:
// they only work in a chat page with attachments, which ramprate's own MCP
// server leaves out too and this site doesn't have.
// Plain JSON-schema objects, handed straight to the MCP SDK's tools/list.
export const ADMIN_TOOLS = [
  {
    name: "github_list_dir",
    description:
      "List files and subdirectories at a path in the repo, relative to repo root. Use an empty string for the repo root.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description:
            'e.g. "src/app/about". Use "" (empty string) for the repo root — do not pass quotes, "." or "/".',
        },
      },
      required: ["path"],
    },
  },
  {
    name: "github_read_file",
    description:
      "Read the current contents of a file in the repo. Always do this before editing a file.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "e.g. src/app/about/page.tsx" },
      },
      required: ["path"],
    },
  },
  {
    name: "github_search_code",
    description:
      "Find where something lives in the code, so you know which file to read and edit. Searches file names AND the text inside files. Use words a person would see on the page (a headline, a button label), a component or page name (e.g. \"HeroSection\", \"find-your-coffee\"), or a route. Returns matching file paths, and the matching lines with their line numbers. Start here instead of browsing folders with github_list_dir. Pass this change's change_id to search its own version of the code.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description:
            'Words or a name to look for, e.g. "Find Your Love Language" or "brewsoul-quiz". Plain words, no regex; ignores upper/lower case.',
        },
        path_prefix: {
          type: "string",
          description:
            'Optional: only look inside this folder, e.g. "src/components" or "src/lib/content".',
        },
      },
      required: ["query"],
    },
  },
  {
    name: "github_edit_file",
    description:
      "The easiest, safest way to change code: replace exact pieces of text in one file, without rewriting the whole file. Read the file first (github_read_file), then for each change pass `old_text` copied EXACTLY from the file (same spaces and line breaks, include a few surrounding words so it appears only once) and the `new_text` to put in its place. Edits apply in order, all or nothing: if any old_text is missing or appears more than once, nothing is saved and the error says which edit and why. Committed to the change's own working branch (admin/mcp-*), never the live site directly. Use github_write_file only for a new file or a full rewrite.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "e.g. src/app/about/page.tsx" },
        edits: {
          type: "array",
          description: "One or more replacements, applied in order.",
          items: {
            type: "object",
            properties: {
              old_text: {
                type: "string",
                description: "Exact text currently in the file. Must appear exactly once.",
              },
              new_text: {
                type: "string",
                description: "What to put in its place (empty string deletes it).",
              },
            },
            required: ["old_text", "new_text"],
          },
        },
        message: {
          type: "string",
          description: "Short commit message describing the change.",
        },
      },
      required: ["path", "edits", "message"],
    },
  },
  {
    name: "github_write_file",
    description:
      "Create or update a file with new content. Committed to the pending change's working branch (admin/mcp-*), never the default branch directly. Pass the FULL new file content, not a diff.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string" },
        content: { type: "string" },
        message: {
          type: "string",
          description: "Short commit message describing the change.",
        },
      },
      required: ["path", "content", "message"],
    },
  },
  {
    name: "github_delete_file",
    description:
      "Delete a file. Committed to the pending change's working branch (admin/mcp-*), never the default branch directly.",
    input_schema: {
      type: "object" as const,
      properties: { path: { type: "string" }, message: { type: "string" } },
      required: ["path", "message"],
    },
  },
  {
    name: "github_write_binary_file",
    description:
      "Write an image, PDF or other binary file into this change. Send the file ONE of these ways: `file` (ChatGPT: the file the person attached, ChatGPT fills it in), `source_url` (a public https link to the file), or `base64Content` (only if you truly have the file's bytes). You cannot turn a picture you can see in the chat into base64, so never try: if the person attached a file and `file` isn't available (e.g. in Claude), call request_upload_link and give them the link instead. The file's name ending must match what it really is (.png, .jpg, .webp, .svg, .pdf...). This site has no CMS, so images go in public/ (e.g. public/images/...) and are shown with next/image.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description:
            "Where to save it in the repo, e.g. public/images/tsi-hero.png",
        },
        file: OPENAI_FILE_SCHEMA,
        source_url: {
          type: "string",
          description: "A public https link straight to the file.",
        },
        base64Content: {
          type: "string",
          description:
            "The file's real bytes as base64. Not for attached files.",
        },
        message: { type: "string" },
      },
      required: ["path", "message"],
    },
  },
  {
    name: "seo_check_page",
    description:
      "Fetch a live page on the deployed site and report its title, meta description, canonical URL, OG tags, H1s, and JSON-LD block count — a quick SEO health check. Checks the LIVE production site, not the working branch.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "Site route, e.g. /growth or /" },
      },
      required: ["path"],
    },
  },
  {
    name: "check_code_quality",
    description:
      "Check proposed file content BEFORE writing it: runs ESLint and flags this project's house-rule violations from CONTRIBUTING.md (inline style={{}}, <img> instead of next/image, framer-motion, non-canonical Tailwind classes, Manus URLs, ellipsis loading text, write-client in a Client Component). Always call this on .ts/.tsx content before github_write_file, and fix anything it flags first.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description:
            "The file path this content is for, e.g. src/app/about/page.tsx",
        },
        content: { type: "string" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "check_pr_status",
    description:
      "Check the real, current status of every automatic check on the pending change (the Netlify deploy-preview build, plus any GitHub Actions checks) — call this any time the admin asks about a failing check, mentions an error or the workflow, or before telling them something is ready to publish. If checks are still running, this call itself waits up to ~20s for them to finish before returning — you do not need to (and cannot) wait on your own between calls. If the result still comes back with status \"pending\" and a `note` field, that means it's still running even after that wait — just call this tool again rather than telling the admin you'll 'wait' or 'check back'; there's no real timer on your side to do that with. Returns each check's name and whether it's passing, still running, or failed, with a failed check's id (for get_check_log_excerpt) and a link. ALL of these checks block Publish equally — none of them are cosmetic-only.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_check_log_excerpt",
    description:
      "Get the tail of the real log output for one failed check, by its id from check_pr_status's failingChecks. Use this to see the actual error (a type error, an ESLint rule, a build failure) instead of guessing — then fix the real file(s) that caused it.",
    input_schema: {
      type: "object" as const,
      properties: {
        checkRunId: {
          type: "number",
          description: "The id field from a failingChecks entry.",
        },
      },
      required: ["checkRunId"],
    },
  },
];

export interface AdminToolContext {
  getReadBranch: () => Promise<string>;
  ensureWriteBranch: () => Promise<string>;
  getPRNumber: () => Promise<number | null>;
  log: (entry: string) => void;
}

export interface ToolCallResult {
  output: unknown;
  isError?: boolean;
}

function denied(path: string): ToolCallResult {
  return {
    output: {
      error: `"${path}" is off-limits to the MCP agent and cannot be read or modified.`,
    },
    isError: true,
  };
}

// The model sometimes hands us a path that's been JSON-quoted (`""`,
// `"src/app"`), prefixed (`./`, `/`), or given a placeholder (`.`, `root`)
// for the repo root. Normalize all of it to a clean repo-relative path
// (`""` === root) before it reaches the GitHub API — a literal `""` was
// getting URL-encoded to `%22%22` and 404ing.
export function normalizeRepoPath(raw: unknown): string {
  let p = String(raw ?? "").trim();
  while (
    p.length >= 2 &&
    ((p.startsWith('"') && p.endsWith('"')) ||
      (p.startsWith("'") && p.endsWith("'")))
  ) {
    p = p.slice(1, -1).trim();
  }
  p = p.replace(/^\.?\/+/, "").replace(/\/+$/, "");
  if (p === "." || p === "/" || p.toLowerCase() === "root") return "";
  return p;
}

export interface TextEdit {
  old_text: string;
  new_text: string;
}

// Applies exact-text replacements in order, all or nothing. Each old_text
// must occur exactly once in the file as it stands after the earlier edits,
// so an edit can never land in the wrong place.
export function applyTextEdits(
  content: string,
  edits: TextEdit[],
): { ok: true; content: string } | { ok: false; error: string } {
  let next = content;
  for (const [i, edit] of edits.entries()) {
    const label = `Edit ${i + 1} of ${edits.length}`;
    if (!edit.old_text) {
      return { ok: false, error: `${label}: old_text is empty. Copy the exact text to replace from the file.` };
    }
    const count = next.split(edit.old_text).length - 1;
    if (count === 0) {
      return {
        ok: false,
        error: `${label}: old_text was not found. Read the file again with github_read_file and copy the text exactly (spaces, quotes and line breaks matter).`,
      };
    }
    if (count > 1) {
      return {
        ok: false,
        error: `${label}: old_text appears ${count} times. Include more of the surrounding text so it matches only one place.`,
      };
    }
    next = next.replace(edit.old_text, () => edit.new_text);
  }
  return { ok: true, content: next };
}

function parseEdits(raw: unknown): TextEdit[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const edits: TextEdit[] = [];
  for (const e of raw) {
    if (!e || typeof e !== "object") return null;
    const { old_text, new_text } = e as Record<string, unknown>;
    if (typeof old_text !== "string" || typeof new_text !== "string") return null;
    edits.push({ old_text, new_text });
  }
  return edits;
}

const SEARCH_NAME_LIMIT = 30;
const SEARCH_TEXT_FILE_LIMIT = 20;
const SEARCH_LINES_PER_FILE = 3;

export interface SearchResult {
  fileNameMatches: string[];
  textMatches: Array<{ path: string; lines: string[] }>;
  textMatchFileCount: number;
}

// File names match the query as a slug ("find your coffee" finds
// find-your-coffee) or by containing every word; text matches are lines that
// contain the whole query, ignoring case, with line numbers so the caller can
// go straight to the spot. Code (src/) is listed before docs and the legacy
// reference copy.
export function searchRepoFiles(
  files: Array<{ path: string; content: string }>,
  query: string,
): SearchResult {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  const slug = q.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const rank = (p: string) => (p.startsWith("src/") ? 0 : p.startsWith("_legacy") ? 2 : 1);
  const sorted = [...files].sort((a, b) => rank(a.path) - rank(b.path));

  const fileNameMatches = sorted
    .map((f) => f.path)
    .filter((p) => {
      const lower = p.toLowerCase();
      return (!!slug && lower.includes(slug)) || words.every((w) => lower.includes(w));
    })
    .slice(0, SEARCH_NAME_LIMIT);

  const allText = sorted.flatMap((f) => {
    const lines: string[] = [];
    f.content.split("\n").forEach((line, i) => {
      if (line.toLowerCase().includes(q)) lines.push(`${i + 1}: ${line.trim().slice(0, 200)}`);
    });
    return lines.length ? [{ path: f.path, lines: lines.slice(0, SEARCH_LINES_PER_FILE) }] : [];
  });

  return {
    fileNameMatches,
    textMatches: allText.slice(0, SEARCH_TEXT_FILE_LIMIT),
    textMatchFileCount: allText.length,
  };
}

function pathRequired(): ToolCallResult {
  return {
    output: { error: "A repo-relative file path is required." },
    isError: true,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// A plain chat client (Claude.ai, ChatGPT) has no way to "wait 60s and check
// again" on its own - it only acts on conversation turns, so asking it to
// wait produces either a stall or a claimed wait that never really
// happened. Doing the waiting here instead means a single call gives an
// honest, current answer: either it resolved within this window, or the
// result says so explicitly and the caller should call again - a real
// instruction instead of asking the model to fake a timer it doesn't have.
// Bounded well under Netlify's synchronous function timeout (worst case,
// free-tier: 10s; this repo's actual plan has handled longer single calls
// already, but there's no reason to push that margin for a status check).
const CHECK_WAIT_BUDGET_MS = 20_000;
const CHECK_POLL_INTERVAL_MS = 3_000;

export async function waitForChecks(
  prNumber: number,
): Promise<gh.PRChecksDetail & { note?: string }> {
  const start = Date.now();
  let detail = await gh.getPRChecksDetail(prNumber);
  while (
    detail.status === "pending" &&
    Date.now() - start < CHECK_WAIT_BUDGET_MS
  ) {
    await sleep(CHECK_POLL_INTERVAL_MS);
    detail = await gh.getPRChecksDetail(prNumber);
  }
  if (detail.status === "pending") {
    return {
      ...detail,
      note: `Still pending after waiting ~${Math.round((Date.now() - start) / 1000)}s. Call check_pr_status again.`,
    };
  }
  return detail;
}

export async function runAdminTool(
  name: string,
  input: Record<string, unknown>,
  ctx: AdminToolContext,
): Promise<ToolCallResult> {
  switch (name) {
    case "github_list_dir": {
      const path = normalizeRepoPath(input.path);
      const entries = await gh.listDir(path, await ctx.getReadBranch());
      return { output: entries };
    }

    case "github_read_file": {
      const path = normalizeRepoPath(input.path);
      if (!path) return pathRequired();
      if (isPathReadDenied(path)) return denied(path);
      const file = await gh.getFile(path, await ctx.getReadBranch());
      if (!file)
        return { output: { error: `${path} does not exist` }, isError: true };
      return { output: { content: file.content } };
    }

    case "github_search_code": {
      const query = String(input.query ?? "").trim();
      const prefix = normalizeRepoPath(input.path_prefix);
      if (!query) {
        return { output: { error: "Say what to look for in `query`." }, isError: true };
      }
      const files = (await gh.getRepoTextFiles(await ctx.getReadBranch())).filter(
        (f) =>
          !isPathReadDenied(f.path) &&
          (!prefix || f.path === prefix || f.path.startsWith(`${prefix}/`)),
      );
      const result = searchRepoFiles(files, query);
      return {
        output: {
          ...result,
          next:
            result.fileNameMatches.length || result.textMatches.length
              ? "Open the most likely file with github_read_file, then change it with github_edit_file."
              : "Nothing matched. Try fewer or different words, a component name, or the page's route.",
        },
      };
    }

    case "github_edit_file": {
      const path = normalizeRepoPath(input.path);
      const message = String(input.message ?? "MCP edit");
      if (!path) return pathRequired();
      if (isPathDenied(path)) return denied(path);
      const edits = parseEdits(input.edits);
      if (!edits) {
        return {
          output: { error: "`edits` must be a list of { old_text, new_text } pairs (at least one)." },
          isError: true,
        };
      }
      const branch = await ctx.ensureWriteBranch();
      const file = await gh.getFile(path, branch);
      if (!file) {
        return {
          output: { error: `${path} does not exist. Use github_write_file to create a new file.` },
          isError: true,
        };
      }
      const result = applyTextEdits(file.content, edits);
      if (!result.ok) return { output: { error: result.error }, isError: true };
      if (result.content === file.content) {
        return { output: { ok: true, path, branch, unchanged: true } };
      }
      await gh.putFile(path, result.content, message, branch);
      ctx.log(`Edited ${path} on ${branch} (${edits.length} edit(s)): ${message}`);
      return { output: { ok: true, path, branch, editsApplied: edits.length } };
    }

    case "github_write_file": {
      const path = normalizeRepoPath(input.path);
      const content = String(input.content ?? "");
      const message = String(input.message ?? "MCP edit");
      if (!path) return pathRequired();
      if (isPathDenied(path)) return denied(path);
      const branch = await ctx.ensureWriteBranch();
      await gh.putFile(path, content, message, branch);
      ctx.log(`Wrote ${path} on ${branch}: ${message}`);
      return { output: { ok: true, path, branch } };
    }

    case "github_delete_file": {
      const path = normalizeRepoPath(input.path);
      const message = String(input.message ?? "MCP delete");
      if (!path) return pathRequired();
      if (isPathDenied(path)) return denied(path);
      const branch = await ctx.ensureWriteBranch();
      await gh.deleteFile(path, message, branch);
      ctx.log(`Deleted ${path} on ${branch}: ${message}`);
      return { output: { ok: true, path, branch } };
    }

    case "github_write_binary_file": {
      const path = normalizeRepoPath(input.path);
      const message = String(input.message ?? "MCP binary upload");
      if (!path) return pathRequired();
      if (isPathDenied(path)) return denied(path);
      const file = await resolveBinaryInput(input);
      const problem = file.ok
        ? checkFileMatchesPath(path, file.bytes)
        : file.error;
      if (!file.ok || problem) {
        return { output: { error: problem }, isError: true };
      }
      const branch = await ctx.ensureWriteBranch();
      await gh.putFileBase64(
        path,
        file.bytes.toString("base64"),
        message,
        branch,
      );
      ctx.log(`Wrote binary file ${path} on ${branch}: ${message}`);
      return {
        output: { ok: true, path, branch, sizeBytes: file.bytes.length },
      };
    }

    case "seo_check_page": {
      const path = String(input.path ?? "/");
      try {
        const result = await checkPageSeo(path);
        return { output: result };
      } catch (err) {
        return {
          output: {
            error: err instanceof Error ? err.message : "Fetch failed",
          },
          isError: true,
        };
      }
    }

    case "check_code_quality": {
      const path = normalizeRepoPath(input.path);
      const content = String(input.content ?? "");
      try {
        const result = await checkCode(path, content);
        return { output: result };
      } catch (err) {
        return {
          output: {
            error: err instanceof Error ? err.message : "Code check failed",
          },
          isError: true,
        };
      }
    }

    case "check_pr_status": {
      const prNumber = await ctx.getPRNumber();
      if (!prNumber) {
        return {
          output: {
            status: "no_pending_change",
            message: "There's no pending change with checks running yet.",
          },
        };
      }
      try {
        const detail = await waitForChecks(prNumber);
        return { output: detail };
      } catch (err) {
        return {
          output: {
            error:
              err instanceof Error ? err.message : "Failed to check status",
          },
          isError: true,
        };
      }
    }

    case "get_check_log_excerpt": {
      const checkRunId = Number(input.checkRunId);
      if (!Number.isFinite(checkRunId)) {
        return {
          output: { error: "A numeric checkRunId is required." },
          isError: true,
        };
      }
      try {
        const log = await gh.getFailingCheckLogExcerpt(checkRunId);
        return { output: { log } };
      } catch (err) {
        return {
          output: {
            error: err instanceof Error ? err.message : "Failed to fetch log",
          },
          isError: true,
        };
      }
    }

    default:
      return { output: { error: `Unknown tool "${name}"` }, isError: true };
  }
}
