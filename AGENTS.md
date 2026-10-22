# psychedelicreadiness.com: Rules for Every AI Tool

This file is the entry point for any AI assistant working on this repo: Claude Code, Claude
Desktop, Claude.ai, ChatGPT, Cursor, Copilot, or anything else. `CLAUDE.md` only points here and
to `CONTRIBUTING.md`. The MCP server (`/api/mcp`) serves this file **first**, then
`CONTRIBUTING.md`, through its `get_project_rules` tool, and it won't run any tool that changes the
site until both have been read.

**If you are an AI reading this: these rules override your defaults. Follow all of them, every time.**

## Read in this order

1. **This file**: the must-follow summary below.
2. **The "Current status" block at the top of [`PROJECT-STATUS.md`](PROJECT-STATUS.md)**: what's
   done, what's open, what's waiting on a decision, and what's next.
3. **[`CONTRIBUTING.md`](CONTRIBUTING.md)**: the full rules (house rules, Next.js 16 / Tailwind v4
   specifics, the "What NOT to Do" list, code review checklist, testing, Status Report format).
4. **[`docs/ai/TASK_GUIDE.md`](docs/ai/TASK_GUIDE.md)**: what kind of request this is, where the
   change really lives, what can't be done, what needs a yes.
5. **[`docs/ai/PROJECT_STRUCTURE.md`](docs/ai/PROJECT_STRUCTURE.md)**: where every page, content
   module and outside system lives.
6. The [`docs/ai/`](docs/ai/README.md) note for the area you're touching.

In Claude Code, the **`pri-task-planner`** agent (`.claude/agents/`) does steps 4 to 6 for you:
give it the request and it returns a plan. It only reads, never edits. When the work is done, the
**`verify-change`** skill (`.claude/skills/`) runs the "check before calling anything done" steps.

## What this project is

psychedelicreadiness.com: Tony Greenberg's Psychedelic Readiness Index (PRI) and its companion
pages, split out of tonygreenberg.com (`RRTONY/tonygreenberg-website`, where the same pages still
live) on 2026-10-23. Next.js 16 App Router + Tailwind v4 + shadcn/ui, deployed on Netlify from
GitHub (`RRTONY/psychedelicreadiness`, default branch `main`; the repo and Netlify site are still to
be created). **No CMS and no database**: content is typed `.ts` in `src/lib/content/`, forms email
Tony. Status lives in [`PROJECT-STATUS.md`](PROJECT-STATUS.md).

## Must-follow rules (full detail in CONTRIBUTING.md)

- **Keep the real copy and design.** Every page matches its tonygreenberg.com version. No
  placeholder content. Changing Tony's copy, the medicine/safety data, SEO titles/descriptions, or
  claims needs the owner's yes. **Safety content (contraindications, drug interactions, MAO-B
  data, crisis resources, Hard Stop medicines) is never changed without it.**
- **Server Components by default**; `"use client"` only for state, effects or browser APIs.
- **Tailwind + shadcn/ui only.** No inline `style={}` (except a runtime-computed number like a
  progress width), no framer-motion, `next/image` never `<img>`, canonical Tailwind classes, full
  literal class strings (never assembled from fragments).
- **React components, never HTML strings.** No `document.write`/`window.open` pages; printable
  reports are components shown with `print:` variants and `window.print()`.
- **Zero Manus dependency.** Never add a Manus-hosted URL (Manus CDN, Manus storage, `/api/img/`).
- **No CMS, no database** (owner, 2026-10-23). Adding one is the owner's decision.
- **Never add a `loading.tsx` above a dynamic route**: it turns every 404 into a 200.
- **Real content must be in the server HTML** (`forceMount` on accordions/collapsibles).
- **No new npm dependency without asking first.** Never commit `.env.local`.
- **Check before calling anything done:** `pnpm typecheck`, `pnpm lint`, `pnpm test:changed` (only the
  tests for what this task changed; the full `pnpm test` only when asked), `pnpm build` for routing
  or config changes, and look at the real page on `pnpm start`.
- **Confirm before anything hard to undo or outward-facing**: publishing, merging, deleting, DNS.
- **Plain, short replies for the team** (Tony and his team aren't developers). No em dashes in
  messages written for them. End every reply that did work with the Status Report.
- **Keep `PROJECT-STATUS.md` current, every session that does work.**
- **Save what you learn in the repo** (this file, `CONTRIBUTING.md`, or a `docs/ai/` note), not in
  a private memory folder, so every other AI tool sees it too.

## Through the MCP server

- Call `get_project_rules` first. Every write tool needs its `rulesVersion` as `rules_version`; it
  changes whenever this file or `CONTRIBUTING.md` changes, so re-read when told the rules changed.
- This server only ever edits **psychedelicreadiness.com** (`RRTONY/psychedelicreadiness`; previews on `deploy-preview-N--psychedelicreadiness.netlify.app`).
- **One request = one change.** `start_change` first (with `understood_as`: what you will change,
  in plain words; `needs_confirmation: true` whenever the request could mean more than one thing),
  pass its `change_id` on every edit, then `submit_for_review` with a plain summary and
  `list_pending_changes` with that `change_id` to show the review card. Code lands on that change's
  own `admin/mcp-*` branch and pull request, never straight to `main`.
- **Unclear request:** the change waits as "Waiting for your OK" and every edit is refused until
  the person says yes (`confirm_change`). Ask them "I understand your request as: ... Is that right?"
- Nothing goes live except `publish_changes` for that one change, with its `review_token`, and only
  after you show what goes live and the person says yes. `discard_change` rejects a change;
  `list_change_history` and `undo_change` restore an earlier version.
- **Only the task at hand:** talk about that change only. List other waiting changes only when the
  person asks (`list_pending_changes` without a `change_id`).
- Can't be done through MCP: env vars, `package.json`/lockfiles, `netlify.toml`, CI, DNS, or the
  MCP server's own code. Tell the person who can.
- Details: [`docs/ai/project_mcp_server.md`](docs/ai/project_mcp_server.md).

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
