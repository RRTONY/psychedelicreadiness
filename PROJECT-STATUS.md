# psychedelicreadiness.com: Project Status

> The main project file. Read the "Current status" block at the start of every session and update
> it (plus the items you finished) at the end.

## Current status — 2026-11-11

**Live 2026-11-11:** noindex on the live domain (00:55 IST); review fixes, PR #1 (merged 01:07 IST).
**Follow-up (branch `fix/deep-link-hydration`):** `?m=` medicine links no longer fail hydration
(React #418 on every `?m=` visit).

**Review from Sam / Darryl (2026-11-11, night): site B on hold, everything below is on branches, not live.**
- The site is public (my pushes to main on 2026-11-11 at 00:10, 00:21, 00:24 IST went live, at the
  user's request). Branch `hold/site-b-noindex` adds noindex to every page of the live domain
  (the Netlify URL already had it). Pushing it to main was blocked here: needs a person to merge.
- Branch `preview/site-b-review` (preview only): Peyote "Pharma to Plant" table removed (component
  and data deleted), "39 substances" everywhere, og:url on every page, alt text on the hero and
  medicine photos, labels + aria-pressed on the 39 save buttons, QR on the share card, explicit
  Hard Stop / Caution field on the interaction guide (values unchanged). 789 tests pass.
- Checked end to end at 390px: 50 questions, consent, results, a match, Compare Medicines.
- Visitor data: answers stay in the browser tab; consent and saved medicines in session/local
  storage; initials are checked, not saved or sent; the correction form emails Tony; the
  introduction request opens the visitor's own email app. `/api/` and `/oauth/` are the admin
  editing server, not visitor data.

**Waiting on a decision (review):**
- [ ] Clinical reviewer (Darryl): the correct label for SSRIs / SNRIs, non-selective MAOIs and
  MAO-B inhibitors (`label` in `MEDICATION_INTERACTIONS`), and warnings for Datura, Brugmansia,
  Sassafras/MDA and Nitrous Oxide (their safety warning is still "Safety data is being compiled").
- [ ] Iboga page has a similar 8-row pharma-alternatives table: remove too?
- [ ] 301 from tonygreenberg.com's PRI pages: not added. It conflicts with Sam's plan to patch
  the tool on tonygreenberg.com, and site B is on hold.
- [ ] Waiting for text: Privacy, Terms, Contact, About (Josh); held: Evidence page, Buy buttons,
  investment disclosure, Facilitator Index, Iboga Compass intro.

**Done this session (2026-11-11):** PRI scoring safety fixes from the 7 Nov 2026 scoring review
(PRI-Scoring-Review.pdf; the "patch" it mentions was never received, so this was built here):
- Every readiness question needs an explicit answer: sliders start unanswered and Next stays
  disabled until moved, clicked or set with the arrow keys (tabbing onto it doesn't count).
- Accepting the disclaimer to browse a medicine now opens that medicine only; it used to show a
  personal result built from untouched sliders.
- Any of the 14 `hard_stop` statements answered below "Often true" (`HARD_STOP_CLEAR_MIN` = 7 in
  `src/lib/content/pri-shared.ts`) pauses the overall score, dimensions, matches, sequence, Save
  My Results and the referral form. The visitor sees the existing "Any Red"/"Multiple Red"
  guidance and the statements to bring to a clinician. The audit profile (cardiac answer 1,
  everything else 10) used to get 99/100 overall and 87/100 ibogaine.
- Verified: typecheck, lint, `test:changed` (79 passed, 98% statements), `pnpm build`, and the real
  page on `pnpm start` at 375 / 820 / 1280px.

- Later the same day, the rest of the review (owner: Tony approved all of it, 2026-11-11):
  - "Talk to your psychedelic council" reminder (`src/components/pri/council-reminder.tsx`) on
    every assessment screen, the medicine profile, the printed report (address written out) and
    the share image.
  - New page `/disclaimer` (full disclaimer, in the footer and sitemap); the review's QR path
    `/psychedelic-readiness-index/disclaimer` 308-redirects to it.
  - Disclaimer text moved to `src/lib/content/pri-disclaimer.ts` (pop-up and page share it). Added
    "What the score can tell you"; the second "What This Is" bullet is the rewritten evidence line.
  - Verified: typecheck, lint, tests, `pnpm build` (`/disclaimer` static), the real page at
    375 / 820 / 1280px, the redirect and the share image.
  - Hard-stop threshold (7) and the paused-score wording: approved by Tony (owner, 2026-11-11).

**Waiting on a decision (scoring review):**
- [ ] The review's links and QR point to **tonygreenberg.com**/psychedelic-readiness-index, where
  the same PRI pages still run. Those pages probably have the same scoring gaps: fix them in
  `RRTONY/tonygreenberg-website` too?
- [x] Printed report QR code to `/disclaimer` (2026-11-11): a fixed SVG in
  `src/components/pri/disclaimer-qr.tsx`, generated once and decoded back from a real print
  screenshot, so no new npm package.

## Status — 2026-10-23

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
