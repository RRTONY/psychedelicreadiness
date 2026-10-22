# Task Guide: What Can We Do, and How

Use this to decide how to handle a request before touching anything. Rules are in
[`/CONTRIBUTING.md`](../../CONTRIBUTING.md); file locations are in
[`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md).

## Step 1. Decide what kind of request it is

1. **Is it a question, a check, or a change?** Questions and checks change nothing: answer them
   with read-only tools (`github_read_file`, `github_search_code`, `seo_check_page`, `check_deploy`).
2. **Where does the thing live?** Everything on this site is code: there is no CMS and no
   database. Outside the repo: Netlify settings and env vars, DNS, Resend (email).
3. **How big is it?** A small copy edit, a normal change, or a big/risky one (a new page, routing,
   redirects, anything in the medicine or safety data)?
4. **Does it need a yes first?** Publishing, deleting, changing SEO copy, and any change to the
   medicine/safety data all need a clear yes from the person.

If the request is unclear, ask **one** short question with 2 to 4 options instead of guessing.

## Step 2. Find the row, follow it

| Request | Where it lives | How (MCP tools) | Ask first? |
| --- | --- | --- | --- |
| Change text on a page | `src/app/<route>/page.tsx` or its component in `src/components/pri/` / `facilitator/` | `github_read_file` → `github_edit_file` → `check_code_quality` → `check_pr_status` → show preview | Only to publish |
| Change PRI questions, scoring or readiness levels | `src/lib/content/pri-data.ts`, `pri-shared.ts` | Code tools | **Yes**: it changes people's results |
| Change medicine facts, contraindications, interactions, crisis resources | `src/lib/content/pri-data.ts`, `pri-safety-data.ts`, `pri-iboga-module.ts`, `pri-mescaline-module.ts` | Code tools | **Yes**, always: safety content |
| Iboga facilities / Compass questions | `src/lib/content/pri-iboga-facility-data.ts`, `pri-iboga-compass-data.ts`, `pri-iboga-compass-engine.ts` | Code tools | **Yes**: it changes recommendations |
| Facilitator Index questions | `src/lib/content/facilitator-index-data.ts` | Code tools | Only to publish |
| Header / footer / menu | `src/lib/site-nav.ts`, `src/components/site-header.tsx`, `site-footer.tsx` | Code tools | Only to publish |
| Add a redirect | `next.config.ts` `redirects()` | Code tools | Only to publish |
| Add a new page | New `src/app/<slug>/page.tsx` + `metadata` + `site-nav.ts` | Code tools, follow "Adding a page" in CONTRIBUTING.md | **Yes**: confirm address and content |
| Change a page's Google title / description | The page's `metadata` export | Code tools | **Yes**, SEO copy is a business decision |
| Add or replace an image | Needs a home (see CONTRIBUTING rule 10) | Not possible via MCP | Ask the owner where it should live |
| Where do form emails go | `src/app/forms/actions.ts` (`OWNER_EMAIL`), sent through Resend | Code tools | **Yes** |
| SEO check on a page | The deployed site | `seo_check_page` | No, read-only |
| Env vars, secrets, `package.json`, lockfile, `netlify.toml`, CI, DNS, the MCP server itself | Outside MCP | Not possible via MCP. Tell the person who can do it | n/a |

## Step 3. Do it the standard way

0. `start_change` for this one request, and pass its `change_id` on every edit below.
1. Read the files you'll change first.
2. Make the smallest change that does the job, following CONTRIBUTING.md.
3. Run `check_code_quality` on every changed `.ts`/`.tsx` file and fix what it flags.
4. `check_pr_status` until the Netlify deploy preview passes (`check_deploy` with the change_id
   says in plain words whether the preview is ready, building or failed), then open the preview.
5. `submit_for_review` with a 1 to 3 sentence plain summary (and before/after for visible wording),
   then `list_pending_changes` with the `change_id` to show what will go live.
6. Publish (`publish_changes` with the `change_id` and `reviewToken`) only after asking "You are
   about to publish these changes to the live psychedelicreadiness.com website. Are you sure you
   want to continue?" and getting a clear yes. If not, `discard_change`. To roll back,
   `list_change_history` then `undo_change`.

## Common mistakes to avoid

- Editing the same page on tonygreenberg.com and expecting this site to change (or the other way
  round). The two copies are separate since 2026-10-23.
- Building a page or report as an HTML string. Use a React component (CONTRIBUTING rule 21).
- Building a Tailwind class from fragments (`` `hover:${c}` ``). Precompose the full literal string.
- Real content inside a collapsed `Accordion`/`Collapsible` without `forceMount`.
- "Loading…" text as a pending state instead of a `Loader2` spinner.
- Adding a database, CMS or analytics "while you're there". That's the owner's decision.
