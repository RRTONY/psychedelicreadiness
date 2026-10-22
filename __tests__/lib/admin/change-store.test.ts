import { beforeEach, describe, expect, it, vi } from "vitest";
import * as gh from "@/lib/admin/github-client";

vi.mock("@/lib/admin/github-client", () => ({
  branchExists: vi.fn(async () => true),
  createOrphanBranch: vi.fn(async () => {}),
  getFile: vi.fn(async () => null),
  putFile: vi.fn(async () => {}),
  getRepoTextFiles: vi.fn(async () => []),
  errorStatus: vi.fn(() => null),
}));

// The module remembers that the branch exists, so each test loads it fresh.
async function load() {
  vi.resetModules();
  return import("@/lib/admin/change-store");
}

beforeEach(() => {
  vi.mocked(gh.branchExists).mockResolvedValue(true);
});

describe("change-store", () => {
  it("creates the mcp-state branch once, with no history, when it's missing", async () => {
    vi.mocked(gh.branchExists).mockResolvedValue(false);
    const store = await load();
    await store.readRecord("k1");
    await store.readRecord("k2");
    expect(gh.createOrphanBranch).toHaveBeenCalledTimes(1);
    expect(gh.createOrphanBranch).toHaveBeenCalledWith("mcp-state", [{ path: "README.md", content: expect.stringMatching(/MCP change records/) }], expect.any(String));
  });

  it("treats a branch created a moment ago by another request (422) as ready, and rethrows anything else", async () => {
    vi.mocked(gh.branchExists).mockResolvedValue(false);
    vi.mocked(gh.createOrphanBranch).mockRejectedValueOnce(new Error("exists"));
    vi.mocked(gh.errorStatus).mockReturnValueOnce(422);
    await expect((await load()).readRecord("k")).resolves.toBeNull();
    vi.mocked(gh.createOrphanBranch).mockRejectedValueOnce(new Error("forbidden"));
    vi.mocked(gh.errorStatus).mockReturnValueOnce(403);
    await expect((await load()).readRecord("k")).rejects.toThrow("forbidden");
  });

  it("reads one record from changes/<key>.json on the state branch, null when missing or damaged", async () => {
    const store = await load();
    vi.mocked(gh.getFile).mockResolvedValueOnce({ content: '{"key":"k","status":"draft"}', sha: "s" });
    await expect(store.readRecord("k")).resolves.toEqual({ key: "k", status: "draft" });
    expect(gh.getFile).toHaveBeenCalledWith("changes/k.json", "mcp-state");
    vi.mocked(gh.getFile).mockResolvedValueOnce({ content: "{oops", sha: "s" });
    await expect(store.readRecord("k")).resolves.toBeNull();
    await expect(store.readRecord("missing")).resolves.toBeNull();
  });

  it("writes pretty JSON with a commit message", async () => {
    await (await load()).writeRecord("k", { key: "k" }, "Change k: new");
    expect(gh.putFile).toHaveBeenCalledWith("changes/k.json", '{\n  "key": "k"\n}\n', "Change k: new", "mcp-state");
  });

  it("patchRecord merges into the stored record and retries when GitHub says it moved on", async () => {
    const store = await load();
    vi.mocked(gh.getFile).mockResolvedValue({ content: '{"key":"k","status":"draft","title":"T"}', sha: "s" });
    vi.mocked(gh.putFile).mockRejectedValueOnce(new Error("sha mismatch"));
    vi.mocked(gh.errorStatus).mockReturnValueOnce(409);
    await store.patchRecord("k", { status: "published" }, "Change k: published");
    expect(gh.putFile).toHaveBeenCalledTimes(2);
    expect(JSON.parse(vi.mocked(gh.putFile).mock.calls[1][1])).toEqual({ key: "k", status: "published", title: "T" });
  });

  it("patchRecord gives up after three tries, rethrows other errors, and refuses an unknown record", async () => {
    const store = await load();
    await expect(store.patchRecord("nope", {}, "m")).rejects.toThrow("No change record nope");
    vi.mocked(gh.getFile).mockResolvedValue({ content: '{"key":"k"}', sha: "s" });
    vi.mocked(gh.putFile).mockRejectedValue(new Error("conflict"));
    vi.mocked(gh.errorStatus).mockReturnValue(409);
    await expect(store.patchRecord("k", {}, "m")).rejects.toThrow("conflict");
    expect(gh.putFile).toHaveBeenCalledTimes(3);
    vi.mocked(gh.putFile).mockClear();
    vi.mocked(gh.errorStatus).mockReturnValue(500);
    await expect(store.patchRecord("k", {}, "m")).rejects.toThrow("conflict");
    expect(gh.putFile).toHaveBeenCalledTimes(1);
  });

  it("readAllRecords reads every changes/*.json in one download, skipping other and damaged files", async () => {
    vi.mocked(gh.getRepoTextFiles).mockResolvedValueOnce([
      { path: "README.md", content: "# x" },
      { path: "changes/a.json", content: '{"key":"a"}' },
      { path: "changes/b.json", content: "{bad" },
      { path: "changes/notes.txt", content: "x" },
    ]);
    await expect((await load()).readAllRecords()).resolves.toEqual([{ key: "a" }]);
    expect(gh.getRepoTextFiles).toHaveBeenCalledWith("mcp-state");
  });
});
