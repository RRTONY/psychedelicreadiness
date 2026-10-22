# psychedelicreadiness.com: Project Status

> The main project file. Read the "Current status" block at the start of every session and update
> it (plus the items you finished) at the end.

## Current status — 2026-10-23

**Overall:** built from tonygreenberg.com's PRI pages. Code is on GitHub
(https://github.com/RRTONY/psychedelicreadiness, public). Netlify site: `jolly-salamander-f658bb`
(https://jolly-salamander-f658bb.netlify.app); its first build failed (publish folder, fixed in
`netlify.toml`, needs a push). No custom domain yet.

**Done this session (2026-10-23):**
- New Next.js 16 project at `~/Desktop/psychedelicreadiness`, same stack and packages as
  tonygreenberg.com (owner asked).
- 8 pages ported: the Index (now the homepage; `/psychedelic-readiness-index` redirects to `/`),
  Deep Calibration, Efficacy Report, Medicine Sequencing, Iboga & Ibogaine, Iboga Compass,
  Peyote & Mescaline, Facilitator Index.
- No database (owner): forms email Tony instead of saving; calibration's research opt-in and the
  efficacy "Live Calibrations" tab are left out; the admin-only `/pri-research` page isn't ported.
- New icon (readiness gauge), header with phone menu, footer, share image, sitemap, robots, 404.
- Printable reports are React components now (owner): Save My Results and the Facilitator
  question sheet print through `window.print()`, no pop-up HTML strings.
- MCP server ported (no Sanity; change records on an `mcp-state` branch). Google, email/report and
  ClickUp tools left out for now (owner).
- Rules from tonygreenberg.com and ramprate-ui: `AGENTS.md`, `CONTRIBUTING.md`, `docs/ai/`, the
  `pri-task-planner` agent, the `verify-change` skill, the pull-request lint/type-check workflow.
- Tests (Vitest + Testing Library) copied and updated, plus new ones for the new files.

- Later the same day: GitHub repo and Netlify site created (owner). `GITHUB_REPO` env var removed:
  the repo is fixed in `src/lib/admin/site-config.ts` (owner). `.env.local` filled from
  tonyg-site (same MCP team, Resend key; new `MCP_OAUTH_SECRET`) and the Netlify site's name/ID.
  GitHub token checked: read/write on this repo only, expires 2026-11-21.

**Waiting on a decision:**
- [x] Create the GitHub repo and Netlify site (2026-10-23, owner).
- [ ] Netlify environment variables (none set yet): `GITHUB_TOKEN`, `MCP_ADMIN_USERS`,
  `MCP_LOGIN_PASSWORD`, `MCP_OAUTH_SECRET`, `NETLIFY_AUTH_TOKEN`, `RESEND_API_KEY`,
  `MCP_SITE_ORIGIN` (the netlify.app URL until the domain is pointed). `NETLIFY_SITE_NAME` only if
  the site isn't renamed to `psychedelicreadiness`.
- [ ] GitHub token expires 2026-11-21: renew in `.env.local` and Netlify.
- [ ] Point psychedelicreadiness.com's DNS at Netlify.
- [ ] Email sender: tonygreenberg.com's Resend sender for now (Resend key copied); verify psychedelicreadiness.com later?
- [ ] tonygreenberg.com's PRI pages: keep both, or 301-redirect them here (affects Google rankings).
- [ ] Footer line "For education only. Not medical advice." is new wording: Tony to approve.
- [ ] Google Analytics / Search Console for the new domain (and the MCP Google tools).

**Next up:** the decisions above, then a deploy preview check at 375 / 820 / 1280px.

## Open items

- [ ] MCP server: test one change end to end against the real repo and a deploy preview.
- [ ] When the domain points at Netlify: set `MCP_PUBLIC_ORIGIN` and `MCP_SITE_ORIGIN` to
  `https://psychedelicreadiness.com` on Netlify (leave `MCP_PUBLIC_ORIGIN` empty in `.env.local`).
  `MCP_OAUTH_REDIRECT_HOSTS` stays empty (Claude/ChatGPT hosts are built in). `EMAIL_FROM` is
  "Only Time Buys Trust <trust@tonygreenberg.com>" (owner, 2026-10-23; verified in Resend).
