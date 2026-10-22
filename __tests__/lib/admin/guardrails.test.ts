import { describe, expect, it } from "vitest";
import { ADMIN_BRANCH_PREFIX, isPathDenied, isPathReadDenied } from "@/lib/admin/guardrails";

describe("isPathDenied (writes)", () => {
  it.each([
    ".env",
    ".env.local",
    ".ENV.production",
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "netlify.toml",
    ".mcp.json",
    ".github/workflows/ci.yml",
    ".git/config",
    "src/proxy.ts",
    "src/lib/admin/mcp-auth.ts",
    "src/lib/admin/guardrails.ts",
    "src/app/api/mcp/route.ts",
    "src/app/api/oauth/token/route.ts",
    "src/app/oauth/authorize/page.tsx",
    "src/app/.well-known/oauth-authorization-server/route.ts",
  ])("blocks %s", (path) => {
    expect(isPathDenied(path)).toBe(true);
  });

  it("strips leading slashes so /package.json is still blocked", () => {
    expect(isPathDenied("/package.json")).toBe(true);
    expect(isPathDenied("///src/lib/admin/tools.ts")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isPathDenied("SRC/LIB/ADMIN/tools.ts")).toBe(true);
    expect(isPathDenied("Package.JSON")).toBe(true);
  });

  it.each(["next.config.ts", "src/app/page.tsx", "src/lib/content/pri-data.ts", "docs/ai/README.md", "public/images/a.png"])(
    "allows %s",
    (path) => {
      expect(isPathDenied(path)).toBe(false);
    },
  );
});

describe("isPathReadDenied", () => {
  it("lets secret-free build files be read", () => {
    for (const p of ["package.json", "netlify.toml", ".github/workflows/ci.yml", "src/proxy.ts"]) expect(isPathReadDenied(p)).toBe(false);
  });

  it("never lets secrets, the lockfile or the admin code be read", () => {
    for (const p of [".env", ".env.local", "pnpm-lock.yaml", ".mcp.json", "src/lib/admin/mcp-oauth.ts", "src/lib/admin/change-store.ts", ".github/secrets.txt", ".git/HEAD"])
      expect(isPathReadDenied(p)).toBe(true);
  });

  it("allows ordinary files", () => {
    expect(isPathReadDenied("src/app/page.tsx")).toBe(false);
  });
});

describe("branch prefix", () => {
  it("admin branches are admin/mcp-*", () => {
    expect(ADMIN_BRANCH_PREFIX).toBe("admin/mcp-");
  });
});
