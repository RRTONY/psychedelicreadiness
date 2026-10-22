import { beforeEach, describe, expect, it, vi } from "vitest";
import * as gh from "@/lib/admin/github-client";
import { lintChangedFiles } from "@/lib/admin/code-check";
import { waitForChecks } from "@/lib/admin/tools";
import { reviewToken } from "@/lib/admin/change-describe";
import * as cs from "@/lib/admin/change-sets";
import type { ChangeSet } from "@/lib/admin/change-sets";

// A small in-memory stand-in for the GitHub-backed record store: records by
// key, plus every patch in order.
const db = vi.hoisted(() => ({ records: new Map<string, Record<string, unknown>>(), patches: [] as { key: string; set: Record<string, unknown> }[] }));
vi.mock("@/lib/admin/change-store", () => ({
  readRecord: vi.fn(async (key: string) => (db.records.has(key) ? structuredClone(db.records.get(key)) : null)),
  writeRecord: vi.fn(async (key: string, record: Record<string, unknown>) => {
    db.records.set(key, structuredClone(record));
  }),
  patchRecord: vi.fn(async (key: string, set: Record<string, unknown>) => {
    const current = db.records.get(key);
    if (!current) throw new Error(`No change record ${key}`);
    db.patches.push({ key, set });
    db.records.set(key, { ...current, ...structuredClone(set) });
  }),
  readAllRecords: vi.fn(async () => [...db.records.values()].map((r) => structuredClone(r))),
}));
vi.mock("@/lib/admin/github-client", () => ({
  GITHUB_REPO: { owner: "RRTONY", repo: "psychedelicreadiness" },
  compareToDefaultBranch: vi.fn(async () => ({ aheadBy: 1, files: [{ path: "src/app/about/page.tsx", status: "modified", additions: 1, deletions: 1 }] })),
  getPRHeadSha: vi.fn(async () => "head1"),
  getPRCombinedStatus: vi.fn(async () => "success"),
  getPRState: vi.fn(),
  mergePR: vi.fn(async () => ({ merged: true, sha: "merge1" })),
  deleteBranch: vi.fn(async () => {}),
  closePR: vi.fn(async () => {}),
  listOpenAdminPRs: vi.fn(async () => []),
  listBranches: vi.fn(async () => []),
  getCommitFiles: vi.fn(async () => ({ parentSha: "p", files: [{ path: "src/app/about/page.tsx", status: "modified", previousPath: null }] })),
  getFile: vi.fn(async () => ({ content: "x", sha: "s" })),
  errorStatus: vi.fn(() => null),
  getDefaultBranch: vi.fn(async () => "main"),
  getFileSha: vi.fn(async () => "sha"),
  createBranchWithFileStates: vi.fn(async () => {}),
  openPR: vi.fn(async () => ({ number: 12, url: "u12" })),
}));
vi.mock("@/lib/admin/tools", () => ({ waitForChecks: vi.fn(async () => ({ status: "success", build: "success", ci: "success", previewUrl: "https://deploy-preview-4--psychedelicreadiness.netlify.app", failingChecks: [] })) }));
vi.mock("@/lib/admin/code-check", () => ({ lintChangedFiles: vi.fn(async () => [{ path: "src/app/about/page.tsx", errors: 0, warnings: 0, couldNotRun: null }]) }));

const user = { name: "Tony", email: "tony@example.com", role: "write" as const };
const KEY = "20261016-abc123";
const token = () => reviewToken("head1");

function seed(over: Partial<ChangeSet> = {}): ChangeSet {
  const c = {
    key: KEY,
    title: "Fix typo",
    request: "Fix the typo on /about",
    requestedBy: { name: "Kim", email: "kim@example.com" },
    status: "ready_for_review",
    createdAt: "2026-10-16T10:00:00Z",
    branch: `admin/mcp-${KEY}`,
    prNumber: 4,
    lint: { headSha: "head1", files: [] },
    ...over,
  } as ChangeSet;
  db.records.set(c.key, structuredClone(c) as never);
  return c;
}

const lastPatch = (key = KEY) => db.patches.filter((p) => p.key === key).at(-1)!.set;

beforeEach(() => {
  db.records.clear();
  db.patches.length = 0;
});

describe("basics", () => {
  it("branches are admin/mcp-<key>", () => {
    expect(cs.branchForChange(KEY)).toBe(`admin/mcp-${KEY}`);
  });

  it("createChangeSet trims fields, saves the record and waits for an OK when unclear", async () => {
    const c = await cs.createChangeSet({ title: "t".repeat(200), request: "r", user, needsConfirmation: true, appliesTo: "tablet" as never });
    expect(c.title).toHaveLength(120);
    expect(c.status).toBe("awaiting_confirmation");
    expect(c.appliesTo).toBe("both");
    expect(db.records.get(c.key)).toMatchObject({ key: c.key, requestedBy: { name: "Tony", email: "tony@example.com" }, branch: null, prNumber: null });
    expect(await cs.getChangeSet(c.key)).toMatchObject({ key: c.key });
    expect(await cs.getChangeSet("20990101-zzzzzz")).toBeNull();
  });

  it("a clear request starts as a draft", async () => {
    const c = await cs.createChangeSet({ title: "t", request: "r", user, understoodAs: "u", conversationUrl: "https://claude.ai/chat/1" });
    expect(c).toMatchObject({ status: "draft", understoodAs: "u", conversationUrl: "https://claude.ai/chat/1", undoes: null });
  });

  it("isOpen covers the three waiting statuses", () => {
    expect(["awaiting_confirmation", "draft", "ready_for_review", "published", "discarded"].map((s) => cs.isOpen({ status: s } as ChangeSet))).toEqual([true, true, true, false, false]);
  });

  it("an edit after review sends the change back to draft; on a draft it only stamps the time", async () => {
    const c = seed();
    await cs.markEdited(c);
    expect(c.status).toBe("draft");
    expect(lastPatch()).toMatchObject({ status: "draft", submittedAt: null });
    await cs.markEdited(c);
    expect(Object.keys(lastPatch())).toEqual(["lastEditedAt"]);
  });

  it("listChangeSets sorts newest first, clamps the limit and filters by status only when asked", async () => {
    seed({ key: "20261016-aaa111", createdAt: "2026-10-16T01:00:00Z", status: "draft" });
    seed({ key: "20261016-bbb222", createdAt: "2026-10-16T03:00:00Z", status: "published" });
    seed({ key: "20261016-ccc333", createdAt: "2026-10-16T02:00:00Z", status: "discarded" });
    expect((await cs.listChangeSets({})).map((c) => c.key)).toEqual(["20261016-bbb222", "20261016-ccc333", "20261016-aaa111"]);
    expect((await cs.listChangeSets({ limit: 0 })).map((c) => c.key)).toEqual(["20261016-bbb222"]);
    expect((await cs.listOpenChangeSets()).map((c) => c.key)).toEqual(["20261016-aaa111"]);
  });
});

describe("confirmChange", () => {
  it("moves an awaiting change to draft with the chosen scope", async () => {
    seed({ status: "awaiting_confirmation" });
    await expect(cs.confirmChange(KEY, "mobile")).resolves.toEqual({ ok: true, changeId: KEY, appliesTo: "mobile" });
    expect(lastPatch()).toMatchObject({ status: "draft", appliesTo: "mobile" });
  });

  it("keeps the scope already chosen when none is given", async () => {
    seed({ status: "awaiting_confirmation", appliesTo: "desktop" });
    await expect(cs.confirmChange(KEY, undefined)).resolves.toMatchObject({ appliesTo: "desktop" });
  });

  it("is a no-op for an already-started change and refuses a finished or unknown one", async () => {
    seed({ status: "draft", appliesTo: "desktop" });
    await expect(cs.confirmChange(KEY, "mobile")).resolves.toEqual({ ok: true, changeId: KEY, appliesTo: "desktop" });
    seed({ status: "published" });
    await expect(cs.confirmChange(KEY, "both")).resolves.toEqual({ ok: false, error: "This change is already published." });
    await expect(cs.confirmChange("20990101-zzzzzz", "both")).resolves.toMatchObject({ ok: false });
  });
});

describe("submitForReview", () => {
  it("refuses finished, unconfirmed or empty changes", async () => {
    await expect(cs.submitForReview(seed({ status: "published" }), "s", [])).resolves.toMatchObject({ ok: false });
    await expect(cs.submitForReview(seed({ status: "awaiting_confirmation" }), "s", [])).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/hasn't confirmed/) });
    vi.mocked(gh.compareToDefaultBranch).mockResolvedValueOnce({ aheadBy: 0, files: [] });
    await expect(cs.submitForReview(seed({ status: "draft" }), "s", [])).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/Nothing has been changed/) });
    await expect(cs.submitForReview(seed({ status: "draft", branch: null }), "s", [])).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/Nothing has been changed/) });
  });

  it("lints the exact head and marks the change ready", async () => {
    const r = await cs.submitForReview(seed({ status: "draft" }), "Fixed the typo", [{ label: "Title", before: "Teh", after: "The" }]);
    expect(r).toMatchObject({ ok: true, status: "ready_for_review", lint: { headSha: "head1" } });
    expect(lintChangedFiles).toHaveBeenCalledWith([{ path: "src/app/about/page.tsx", content: "x" }]);
    expect(lastPatch()).toMatchObject({ status: "ready_for_review", summary: "Fixed the typo", areas: ["/about page"] });
  });

  it("records that lint couldn't run, and trims long summaries and before/after", async () => {
    vi.mocked(lintChangedFiles).mockRejectedValueOnce(new Error("eslint missing"));
    await cs.submitForReview(seed({ status: "draft" }), "s".repeat(2000), Array.from({ length: 30 }, () => ({ label: "l", before: "b".repeat(900), after: "a" })));
    const set = lastPatch() as { lint: { files: { couldNotRun: string }[] }; summary: string; beforeAfter: { before: string }[] };
    expect(set.lint.files[0].couldNotRun).toMatch(/eslint missing/);
    expect(set.summary).toHaveLength(1000);
    expect(set.beforeAfter).toHaveLength(20);
    expect(set.beforeAfter[0].before).toHaveLength(500);
  });
});

describe("buildReview", () => {
  it("is publishable when everything passed, with a token for the code version", async () => {
    const r = await cs.buildReview(seed(), 0);
    expect(r).toMatchObject({ state: "ready", canPublish: true, blockers: [], headSha: "head1", reviewToken: token(), prUrl: "https://github.com/RRTONY/psychedelicreadiness/pull/4" });
    expect(r.previewLinks).toEqual([{ label: "/about page", url: "https://deploy-preview-4--psychedelicreadiness.netlify.app/about" }]);
    expect(r).not.toHaveProperty("content");
  });

  it("is blocked while a draft or when a check failed", async () => {
    expect((await cs.buildReview(seed({ status: "draft" }), 0)).canPublish).toBe(false);
    vi.mocked(waitForChecks).mockResolvedValueOnce({ status: "failure", build: "failure", previewUrl: null, failingChecks: [] });
    const r = await cs.buildReview(seed(), 0);
    expect(r.canPublish).toBe(false);
    expect(r.blockers).toContain("Build failed.");
  });

  it("lints the reviewed head when lint is stale, and saves it; a failed lint run blocks", async () => {
    await cs.buildReview(seed({ lint: { headSha: "old", files: [] } }), 0);
    expect(lastPatch()).toMatchObject({ lint: { headSha: "head1" } });
    vi.mocked(lintChangedFiles).mockRejectedValueOnce(new Error("boom"));
    const r = await cs.buildReview(seed({ lint: null }), 0);
    expect(r.canPublish).toBe(false);
  });

  it("an empty open change is blocked", async () => {
    vi.mocked(gh.compareToDefaultBranch).mockResolvedValueOnce({ aheadBy: 0, files: [] });
    const r = await cs.buildReview(seed({ status: "draft" }), 0);
    expect(r.blockers).toContain("Nothing has been changed yet.");
  });

  it("a published change is reviewed from its saved record, without GitHub", async () => {
    const r = await cs.buildReview(seed({ status: "published", files: [{ _key: "f", path: "src/app/page.tsx", status: "modified" }] }), 0);
    expect(r.files).toEqual([{ path: "src/app/page.tsx", status: "modified" }]);
    expect(gh.compareToDefaultBranch).not.toHaveBeenCalled();
    expect(r.canPublish).toBe(false);
  });
});

describe("publishChange", () => {
  it("refuses unknown, draft and already-published changes", async () => {
    await expect(cs.publishChange("20990101-zzzzzz", "t", user)).resolves.toMatchObject({ ok: false });
    seed({ status: "draft" });
    await expect(cs.publishChange(KEY, token(), user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/still a draft/) });
    seed({ status: "published" });
    await expect(cs.publishChange(KEY, token(), user)).resolves.toMatchObject({ ok: false, error: "This change is already published." });
    expect(gh.mergePR).not.toHaveBeenCalled();
  });

  it("refuses when anything changed after review, or there's nothing to publish", async () => {
    seed();
    await expect(cs.publishChange(KEY, "stale-token", user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/updated after it was reviewed/) });
    seed({ prNumber: null });
    await expect(cs.publishChange(KEY, reviewToken(null), user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/nothing in it/) });
    expect(gh.mergePR).not.toHaveBeenCalled();
  });

  it("refuses when lint is stale or couldn't run, or the site check failed or is running", async () => {
    seed({ lint: { headSha: "old", files: [] } });
    await expect(cs.publishChange(KEY, token(), user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/Lint hasn't run/) });
    seed({ lint: { headSha: "head1", files: [{ path: "a", errors: 0, warnings: 0, couldNotRun: "boom" }] } });
    await expect(cs.publishChange(KEY, token(), user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/Lint could not run \(boom\)/) });
    seed();
    vi.mocked(gh.getPRCombinedStatus).mockResolvedValueOnce("failure");
    await expect(cs.publishChange(KEY, token(), user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/site check failed/) });
    vi.mocked(gh.getPRCombinedStatus).mockResolvedValueOnce("pending");
    await expect(cs.publishChange(KEY, token(), user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/still running/) });
    expect(gh.mergePR).not.toHaveBeenCalled();
  });

  it("maps GitHub's merge refusals to plain words and rethrows anything else", async () => {
    seed();
    vi.mocked(gh.mergePR).mockRejectedValueOnce(new Error("conflict"));
    vi.mocked(gh.errorStatus).mockReturnValueOnce(409);
    await expect(cs.publishChange(KEY, token(), user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/updated after it was reviewed/) });
    vi.mocked(gh.mergePR).mockRejectedValueOnce(new Error("not mergeable"));
    vi.mocked(gh.errorStatus).mockReturnValueOnce(405);
    await expect(cs.publishChange(KEY, token(), user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/can't go live as is/) });
    vi.mocked(gh.mergePR).mockResolvedValueOnce({ merged: false, sha: null } as never);
    await expect(cs.publishChange(KEY, token(), user)).resolves.toMatchObject({ ok: false, error: "GitHub could not merge this change." });
    vi.mocked(gh.mergePR).mockRejectedValueOnce(new Error("500"));
    await expect(cs.publishChange(KEY, token(), user)).rejects.toThrow("500");
  });

  it("merges the reviewed head, records who did it and the merged files, and marks the undone change", async () => {
    seed({ undoes: "20261001-orig01" });
    seed({ key: "20261001-orig01", status: "published" });
    vi.mocked(gh.deleteBranch).mockRejectedValueOnce(new Error("already gone"));
    const r = await cs.publishChange(KEY, token(), user);
    expect(r).toEqual({ ok: true, changeId: KEY, mergeSha: "merge1", published: ["src/app/about/page.tsx"] });
    expect(gh.mergePR).toHaveBeenCalledWith(4, "head1");
    expect(lastPatch()).toMatchObject({ status: "published", publishedBy: "Tony", mergeSha: "merge1", areas: ["/about page"] });
    expect(lastPatch("20261001-orig01")).toEqual({ undoneBy: KEY });
  });

  it("keeps the review-time file list if the merged commit can't be read", async () => {
    seed({ files: [{ _key: "f", path: "src/app/page.tsx", status: "modified" }] });
    vi.mocked(gh.getCommitFiles).mockRejectedValueOnce(new Error("down"));
    await expect(cs.publishChange(KEY, token(), user)).resolves.toMatchObject({ ok: true, published: ["src/app/page.tsx"] });
  });
});

describe("discardChange", () => {
  it("closes the PR, deletes the branch and records who discarded", async () => {
    seed({ status: "draft" });
    await expect(cs.discardChange(KEY, user)).resolves.toEqual({ ok: true, changeId: KEY });
    expect(gh.closePR).toHaveBeenCalledWith(4);
    expect(gh.deleteBranch).toHaveBeenCalledWith(`admin/mcp-${KEY}`);
    expect(lastPatch()).toMatchObject({ status: "discarded", discardedBy: "Tony" });
  });

  it("refuses a finished change, closes an older record-less PR, and says when there's neither", async () => {
    seed({ status: "published" });
    await expect(cs.discardChange(KEY, user)).resolves.toMatchObject({ ok: false });
    vi.mocked(gh.listOpenAdminPRs).mockResolvedValueOnce([{ number: 2, branch: "admin/mcp-20250101-old111", url: "u" }]);
    await expect(cs.discardChange("20250101-old111", user)).resolves.toEqual({ ok: true, changeId: "20250101-old111", olderChange: true });
    expect(gh.closePR).toHaveBeenCalledWith(2);
    await expect(cs.discardChange("20250101-none11", user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/No waiting change/) });
  });
});

describe("undoChange", () => {
  it("only undoes known, published, not-yet-undone changes with no undo waiting", async () => {
    await expect(cs.undoChange("20990101-zzzzzz", user)).resolves.toMatchObject({ ok: false });
    seed({ status: "draft" });
    await expect(cs.undoChange(KEY, user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/Only a published change/) });
    seed({ status: "published", undoneBy: "20261017-xyz999" });
    await expect(cs.undoChange(KEY, user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/already undone/) });
    seed({ status: "published" });
    seed({ key: "20261017-und111", status: "ready_for_review", undoes: KEY });
    await expect(cs.undoChange(KEY, user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/already waiting/) });
  });

  it("refuses when a file was changed again on main since the merge, or nothing was recorded", async () => {
    seed({ status: "published", mergeSha: "merge1" });
    vi.mocked(gh.getFileSha).mockResolvedValueOnce("now").mockResolvedValueOnce("then");
    await expect(cs.undoChange(KEY, user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/Can't undo automatically.*\/about page/) });
    seed({ status: "published", mergeSha: null });
    await expect(cs.undoChange(KEY, user)).resolves.toMatchObject({ ok: false, error: expect.stringMatching(/nothing recorded/) });
  });

  it("builds a new ready-for-review change that restores the files", async () => {
    seed({ status: "published", mergeSha: "merge1", publishedAt: "2026-10-16T12:00:00Z" });
    vi.mocked(gh.getCommitFiles).mockResolvedValueOnce({
      parentSha: "p",
      files: [
        { path: "src/app/about/page.tsx", status: "modified", previousPath: null },
        { path: "src/app/new/page.tsx", status: "added", previousPath: null },
        { path: "src/app/b.tsx", status: "renamed", previousPath: "src/app/a.tsx" },
      ],
    } as never);
    const r = await cs.undoChange(KEY, user);
    expect(r).toMatchObject({ ok: true, title: "Undo: Fix typo" });
    if (!r.ok) throw new Error("expected ok");
    expect(gh.createBranchWithFileStates).toHaveBeenCalledWith(
      `admin/mcp-${r.changeId}`,
      [
        { path: "src/app/about/page.tsx", sha: "sha" },
        { path: "src/app/new/page.tsx", sha: null },
        { path: "src/app/b.tsx", sha: null },
        { path: "src/app/a.tsx", sha: "sha" },
      ],
      'Undo "Fix typo" [by Tony]',
    );
    expect(db.records.get(r.changeId)).toMatchObject({ status: "ready_for_review", prNumber: 12, undoes: KEY, summary: expect.stringMatching(/2026-10-16/) });
  });
});

describe("pending rows, overview and history", () => {
  const rows = () =>
    cs.pendingRows(
      [
        { key: "b", title: "B", request: "rb", status: "draft", createdAt: "2026-10-16T02:00:00Z", prNumber: 5, requestedBy: { name: "Kim" } } as ChangeSet,
        { key: "a", title: "A", request: "ra", status: "ready_for_review", createdAt: "2026-10-16T01:00:00Z", prNumber: null, requestedBy: { name: "Dar" }, conversationUrl: "https://claude.ai/chat/1" } as ChangeSet,
        { key: "c", title: "C", request: "rc", status: "published", createdAt: "2026-10-15T01:00:00Z" } as ChangeSet,
      ],
      "x",
    );

  it("pendingRows lists only waiting changes, oldest first, with this site's preview links", () => {
    expect(rows().map((r) => [r.changeId, r.readyToPublish, r.previewUrl])).toEqual([
      ["a", true, null],
      ["b", false, "https://deploy-preview-5--psychedelicreadiness.netlify.app"],
    ]);
  });

  it("otherPendingText summarises them, or says there are none", () => {
    expect(cs.otherPendingText([])).toBe("No other pending changes.");
    expect(cs.otherPendingText(null)).toMatch(/Couldn't load/);
    const text = cs.otherPendingText(rows());
    expect(text).toMatch(/^- A \(change_id a\): Ready for review\. Asked by Dar/);
    expect(text).toMatch(/Original conversation: https:\/\/claude\.ai\/chat\/1/);
  });

  it("changeHistory marks only published, not-undone changes as undoable", async () => {
    seed({ key: "20261016-aaa111", status: "published", createdAt: "3", areas: ["/about page"] });
    seed({ key: "20261016-bbb222", status: "published", undoneBy: "c", createdAt: "2" });
    seed({ key: "20261016-ccc333", status: "discarded", createdAt: "1" });
    const h = await cs.changeHistory(10);
    expect(h.map((e) => e.canUndo)).toEqual([true, false, false]);
    expect(h[0].changed).toEqual(["/about page"]);
  });

  it("pendingOverview lists open changes and PRs that belong to no change", async () => {
    vi.mocked(gh.listOpenAdminPRs).mockResolvedValueOnce([{ number: 4, branch: `admin/mcp-${KEY}`, url: "u4" }, { number: 9, branch: "admin/mcp-old", url: "u9" }]);
    seed({ status: "draft" });
    const o = await cs.pendingOverview();
    expect(o.changes.map((c) => c.changeId)).toEqual([KEY]);
    expect(o.olderChanges).toEqual([{ changeId: "old", prNumber: 9, prUrl: "u9" }]);
    expect(o).not.toHaveProperty("unrelatedDrafts");
  });
});

describe("reconcileWithGitHub", () => {
  it("marks merged changes published and closed ones discarded, and deletes leftover branches", async () => {
    const merged = seed({ key: "20261016-mrg111", prNumber: 1 });
    const closed = seed({ key: "20261016-cls111", prNumber: 2 });
    const open = seed({ key: "20261016-opn111", prNumber: 3 });
    const noPr = seed({ key: "20261016-nop111", prNumber: null });
    vi.mocked(gh.getPRState).mockImplementation((async (n: number) => ({ open: n === 3, merged: n === 1, mergeSha: n === 1 ? "m" : null })) as never);
    vi.mocked(gh.listBranches).mockResolvedValueOnce(["admin/mcp-20261016-opn111", "admin/mcp-stray"]);
    const still = await cs.reconcileWithGitHub([merged, closed, open, noPr]);
    expect(still.map((c) => c.key)).toEqual(["20261016-opn111", "20261016-nop111"]);
    expect(lastPatch("20261016-mrg111")).toMatchObject({ status: "published", publishedBy: "Merged directly in GitHub", mergeSha: "m" });
    expect(lastPatch("20261016-cls111")).toMatchObject({ status: "discarded", discardedBy: "Closed directly in GitHub" });
    expect(gh.deleteBranch).toHaveBeenCalledWith("admin/mcp-stray");
    expect(gh.deleteBranch).not.toHaveBeenCalledWith("admin/mcp-20261016-opn111");
  });

  it("keeps a change open when GitHub can't be asked, and swallows listing failures", async () => {
    const c = seed();
    vi.mocked(gh.getPRState).mockRejectedValueOnce(new Error("down"));
    vi.mocked(gh.listBranches).mockRejectedValueOnce(new Error("down"));
    await expect(cs.reconcileWithGitHub([c])).resolves.toEqual([c]);
  });
});
