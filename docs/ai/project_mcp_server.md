# MCP server (`/api/mcp`)

Lets a team member edit psychedelicreadiness.com from Claude Code, Claude Desktop, Claude.ai or
ChatGPT. Ported on 2026-10-23 from tonygreenberg.com's server (itself from ramprate-ui), with the
same flow: rules first, one request = one change, a review card, publish only on a clear yes.

## What's different from tonygreenberg.com's server

- **No CMS.** This site has no Sanity, so the four `sanity_*` tools, content drafts, "unrelated
  Studio drafts" and content before/after are gone. Every change is a code change on its own
  `admin/mcp-<key>` branch and pull request. Images an AI adds go in `public/`.
- **Change records live in GitHub,** not Sanity: one JSON file per change
  (`changes/<key>.json`) on the repo's `mcp-state` branch (`src/lib/admin/change-store.ts`). The
  branch is created on first use with no shared history (it never holds a copy of the site). No
  tool writes to it, and it is not an `admin/mcp-*` branch. Listing reads it in one tarball
  download; each save is a commit, so the history is auditable in GitHub. Two saves of the same
  record at once: GitHub refuses the second (409) and it retries up to 3 times.
  **Keep Netlify "Branch deploys" off (or main only)** so `mcp-state` is never built.
- **Site identity in one place:** `src/lib/admin/site-config.ts` (domain, server name
  `psychedelicreadiness`, `GITHUB_REPO`, `NETLIFY_SITE_NAME`, preview URLs, the checked origin).
- **Project status file:** `get_project_rules` returns the "Current status" block of
  `PROJECT-STATUS.md` as `projectStatus` (null if the file doesn't exist), plus
  `docs/ai/TASK_GUIDE.md` and `docs/ai/PROJECT_STRUCTURE.md` when present.
- **Left out on purpose (owner, 2026-10-23):** the Google tools (`check_analytics`,
  `search_console_*`, `lighthouse_check_page`), `send_email` / `create_report`, and the ClickUp
  tools, with their files (`google-auth.ts`, `ga4-client.ts`, `gsc-client.ts`,
  `lighthouse-check.ts`, `report-pdf.tsx`, `clickup-client.ts`) and env vars. They can be ported
  from tonygreenberg.com's server later (add each tool to `tools.ts`, classify it in
  `mcp-auth.ts`, gate it in `project-rules.ts`, bring its test). `src/lib/email.ts` stays for the
  site's own forms; the MCP server doesn't use it.
- `check_code_quality` flags a `"use client"` file importing `@/lib/email` or `@/lib/admin/*`
  (both hold API keys) instead of tonygreenberg.com's Sanity write-client check.

## How it works

1. `get_project_rules`: returns `AGENTS.md`, then `CONTRIBUTING.md` (from the default branch),
   the guides, the `docs/ai/` list and a `rulesVersion`. Every tool that changes anything needs it
   as `rules_version` (`src/lib/admin/project-rules.ts`), so editing either file makes connected
   sessions re-read.
2. `start_change` (with `understood_as`; `needs_confirmation: true` when unclear, then every edit
   waits for `confirm_change`).
3. Edits with that `change_id`: `github_edit_file`, `github_write_file`,
   `github_write_binary_file` (or `request_upload_link`), `github_delete_file`. The first edit
   creates the branch and opens the pull request.
4. `submit_for_review` (plain summary, before/after wording) runs the server's own lint on the
   changed files.
5. `list_pending_changes` with the `change_id`: the review card (status, Build / Lint / GitHub
   checks, what goes live, before/after, preview link, Preview | Discard | Publish).
6. `publish_changes` with the `review_token`: merges that one pull request, only if nothing
   changed since the review, lint ran on that exact version, and the checks pass.
   `discard_change` closes it. `list_change_history` + `undo_change` prepare an "Undo" change
   that goes through the same review.

Changes merged or closed directly in GitHub are picked up the next time waiting changes are
listed (marked Published / Discarded), and leftover `admin/mcp-*` branches are deleted.

## Tools

Read (every role): `get_project_rules`, `list_pending_changes`, `list_change_history`,
`check_deploy`, `github_list_dir`, `github_read_file`, `github_search_code`, `seo_check_page`,
`check_code_quality`, `check_pr_status`, `get_check_log_excerpt`.

Edit role adds: `start_change`, `confirm_change`, `request_upload_link`, `submit_for_review`,
`discard_change`, `undo_change`, `github_edit_file`, `github_write_file`,
`github_write_binary_file`, `github_delete_file`.

Write role adds: `publish_changes`.

## Can't be done through MCP (guardrails denylist)

`.env*`, `package.json` / lockfile / `pnpm-workspace.yaml` (read-only), `netlify.toml`
(read-only), `.github/`, `.mcp.json`, `src/proxy.ts`, and the MCP server's own code and sign-in:
`src/lib/admin/`, `src/app/api/mcp/`, `src/app/api/oauth/`, `src/app/oauth/`,
`src/app/.well-known/`.

## Sign-in (OAuth 2.1, stateless)

Same as tonygreenberg.com: no database. Client ids, codes and tokens are HMAC-signed blobs keyed
from `MCP_OAUTH_SECRET` and `MCP_LOGIN_PASSWORD` (changing the password signs everyone out).
Every request re-checks the email against `MCP_ADMIN_USERS`. Discovery:
`/.well-known/oauth-protected-resource/api/mcp` and `/.well-known/oauth-authorization-server`;
sign-in page `/oauth/authorize` (email + team password). Codes go only to claude.ai, claude.com,
chatgpt.com, chat.openai.com, localhost and `MCP_OAUTH_REDIRECT_HOSTS`. 8 failed sign-ins per
15 minutes per IP and per email.

## Connecting

- **Claude Code:** `claude mcp add --transport http psychedelicreadiness <origin>/api/mcp
  --header "Authorization: Bearer <your token>"` (token from your `MCP_ADMIN_USERS` entry).
- **Claude.ai / Claude Desktop / ChatGPT:** add a custom connector with URL `<origin>/api/mcp`
  and nothing else, then sign in with your email and the team password. After a tool change,
  ChatGPT needs the app refreshed (Settings, Apps and Connectors, Refresh) and a new chat.
- **No header support:** `<origin>/api/mcp/<token>` (URLs end up in logs; prefer the header).

## Setup before first use

1. Create the GitHub repo (`GITHUB_REPO`, default `RRTONY/psychedelicreadiness`) with `main`,
   push the site, and connect it to a Netlify site named `NETLIFY_SITE_NAME`.
2. Netlify: deploy previews on for pull requests, branch deploys off (see `mcp-state` above).
3. Set the MCP env vars (`.env.local.example`) in Netlify, Production.
4. `next.config.ts` needs `serverExternalPackages: ["eslint", "eslint-config-next"]`, or the
   server's lint (`code-check.ts`, which imports `eslint.config.mjs`) fails on Netlify with
   "Cannot find module" (seen on ramprate-ui).

## Gotchas carried over

- One invalid tool schema (e.g. a duplicate key in `required`) makes ChatGPT drop every tool
  silently; `withChangeIdParam` / `withRulesVersionParam` never add a key twice.
- The review card's runtime loads from esm.sh with pinned deps
  (`ext-apps@1.7.5?deps=@modelcontextprotocol/sdk@1.30.0,zod@3.25.76`); unpinned, it crashed in
  ChatGPT. The card URI is versioned (`-v1`) because ChatGPT caches it; bump it when the HTML
  changes.
- Netlify's synchronous function limit (~10 s free, 26 s Pro): `check_pr_status` keeps its wait
  under ~20 s. The deploy-preview check shows
  "pending" for about 90 s after a push.
- One `MCP_ADMIN_USERS` entry per person; never share a token.

## Not yet verified

Nothing here has run against a real GitHub repo or Netlify site yet (neither exists). Type check
and lint pass, and so do the tests (`pnpm exec vitest run __tests__/lib/admin __tests__/app/api
__tests__/app/oauth`: 25 files, 409 tests, with GitHub and Netlify faked). First real test: start a change, edit a file, submit, review, discard; then the
same with publish on a harmless edit, and an undo.
