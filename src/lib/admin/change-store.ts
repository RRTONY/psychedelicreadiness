import * as gh from "@/lib/admin/github-client";

// Where the change records live. This site has no CMS or database, so each
// record is one JSON file (changes/<key>.json) on the repo's own
// `mcp-state` branch. That branch is created with no history (it never
// carries a copy of the site), isn't an admin/mcp-* branch, and no tool
// writes to it, so the AI can't rewrite history. Reading every record is one
// tarball download. Each save is a commit on that branch, which also makes
// the history auditable in GitHub.
//
// Netlify only builds `main` and pull requests by default; keep "Branch
// deploys" off (or limited to main) so this branch is never built.

export const STATE_BRANCH = "mcp-state";
const DIR = "changes";

const README = `# MCP change records

Written by the site's MCP server (src/lib/admin/change-store.ts): one JSON file
per change request in changes/. Don't merge this branch and don't edit it by hand.
`;

function recordPath(key: string): string {
  return `${DIR}/${key}.json`;
}

let branchReady = false;

async function ensureBranch(): Promise<void> {
  if (branchReady) return;
  if (!(await gh.branchExists(STATE_BRANCH))) {
    try {
      await gh.createOrphanBranch(
        STATE_BRANCH,
        [{ path: "README.md", content: README }],
        "Start the MCP change records",
      );
    } catch (err) {
      // 422: another request created it a moment ago.
      if (gh.errorStatus(err) !== 422) throw err;
    }
  }
  branchReady = true;
}

export async function readRecord<T>(key: string): Promise<T | null> {
  await ensureBranch();
  const file = await gh.getFile(recordPath(key), STATE_BRANCH);
  if (!file) return null;
  try {
    return JSON.parse(file.content) as T;
  } catch {
    return null;
  }
}

export async function writeRecord(
  key: string,
  record: unknown,
  message: string,
): Promise<void> {
  await ensureBranch();
  await gh.putFile(
    recordPath(key),
    `${JSON.stringify(record, null, 2)}\n`,
    message,
    STATE_BRANCH,
  );
}

// Merges `fields` into the stored record. Two saves at once make GitHub
// refuse the second (409, the file moved on), so re-read and try again.
export async function patchRecord<T extends object>(
  key: string,
  fields: Partial<T>,
  message: string,
): Promise<void> {
  for (let attempt = 0; ; attempt++) {
    const current = await readRecord<T>(key);
    if (!current) throw new Error(`No change record ${key}`);
    try {
      await writeRecord(key, { ...current, ...fields }, message);
      return;
    } catch (err) {
      const status = gh.errorStatus(err);
      if (attempt >= 2 || (status !== 409 && status !== 422)) throw err;
    }
  }
}

export async function readAllRecords<T>(): Promise<T[]> {
  await ensureBranch();
  const files = await gh.getRepoTextFiles(STATE_BRANCH);
  const out: T[] = [];
  for (const f of files) {
    if (!f.path.startsWith(`${DIR}/`) || !f.path.endsWith(".json")) continue;
    try {
      out.push(JSON.parse(f.content) as T);
    } catch {
      // A damaged record is skipped rather than breaking every listing.
    }
  }
  return out;
}
