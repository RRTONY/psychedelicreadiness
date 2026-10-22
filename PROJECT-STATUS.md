# psychedelicreadiness.com: Project Status

> The main project file. Read the "Current status" block at the start of every session and update
> it (plus the items you finished) at the end.

## Current status — 2026-10-23

**Overall:** the site is built locally from tonygreenberg.com's PRI pages. **Nothing is live**: the
GitHub repo, Netlify site and DNS for psychedelicreadiness.com don't exist yet.

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

**Waiting on a decision:**
- [ ] Create the GitHub repo (`RRTONY/psychedelicreadiness`?) and Netlify site, and push.
- [ ] Point psychedelicreadiness.com's DNS at Netlify.
- [ ] Email sender: keep tonygreenberg.com's Resend sender, or verify psychedelicreadiness.com in Resend.
- [ ] tonygreenberg.com's PRI pages: keep both, or 301-redirect them here (affects Google rankings).
- [ ] Footer line "For education only. Not medical advice." is new wording: Tony to approve.
- [ ] Google Analytics / Search Console for the new domain (and the MCP Google tools).

**Next up:** the decisions above, then a deploy preview check at 375 / 820 / 1280px.

## Open items

- [ ] Netlify env vars (see `.env.local.example`): `RESEND_API_KEY`, the MCP ones.
- [ ] MCP server: test against the real repo and a deploy preview once they exist.
