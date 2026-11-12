# psychedelicreadiness.com: Project Status

> The main project file. Read the "Current status" block at the start of every session and update
> it (plus the items you finished) at the end.

## Current status — 2026-11-13

**QA pass received 2026-11-13 (tester, Chrome, 11 Nov), checked against the code.**
- Confirmed passing: A2 hard-stop pause, A3 Next disabled until answered, A4 council line, A5 QR,
  C10 Peyote table gone, D13 internal links.
- Tester's "site is indexable" is not right: robots.txt allows crawling, but every live page sends
  `X-Robots-Tag: noindex, nofollow` (checked with curl). Lifting it is `release/lift-noindex` (Sam).

**Fixed 2026-11-13 (user approved all four, on behalf of Tony / Darryl / Sam), branch `fix/qa-2026-11-13`, live 2026-11-13:**
- [x] C12: every MAO-B matrix row is Hard Stop (psilocybin, LSD, mescaline were Caution), so it
  agrees with the MAO-B Inhibitors label. New line under both tables (`HARD_STOP_MEANING`): "Hard
  Stop means never combine it with a psychedelic while you are taking it. Only stop or taper a
  medicine with your prescriber."
- [x] D14 wording: share text no longer says "find your medicine match ... hard-stop screening";
  ImpactSoul box no longer says "tells you which medicine fits your biology"; Peyote's Latuda
  one-liner removed, outcomes renamed "Self-Reported Outcomes" with a "not a clinical trial" note;
  the medicine card's Peyote blurb no longer mentions the removed pharma table.
- [x] D14 referral: the results page's "connect you with a vetted facility" card removed; Privacy
  no longer mentions PRI introduction requests.
- [x] A1: on tonygreenberg.com (`RRTONY/tonygreenberg-website`, branch
  `fix/pri-redirect-to-psychedelicreadiness`) the 8 PRI pages + its disclaimer redirect here
  (307, temporary, query kept), and leave its sitemap. `/pri-research` stays.
- Verified: typecheck, lint, `test:changed` (137 passed, 98.7% statements), `pnpm build` (all
  static), the real pages on `pnpm start` (server HTML). Not checked visually at 375/820/1280px.
- [x] Peyote: the 9 supplement "Buy" links removed (Sam's held item; user said yes 2026-11-13).
  Same branch. The Iboga page still has its own Buy links (not asked).
- [x] Tester's "Psilocybin / Ayahuasca not reviewed": they saw "Psilocin (Synthetic)" and
  "VLS-01 (DMT Buccal Film)". Psilocybin Mushrooms and Ayahuasca have reviewed data.
- [ ] 14 cards with no reviewed safety data: AI-drafted lists for Darryl to correct and sign off,
  in the Claude doc "PRI safety data draft for clinical review"
  (https://claude.ai/artifact/WdVZmDfs1A1fXDNcKiFUVN). Nothing goes on the site until he ticks a card.
- [x] Published 2026-11-13 (user: "Yes, publish both"): `fix/qa-2026-11-13` merged to main, checked
  live (Hard Stop line on, referral/Latuda/Amazon links gone, noindex still on).
- [ ] tonygreenberg.com redirect: built and checked locally (307s, `?m=` kept, `/pri-research` 200),
  but its main branch is protected: a person must open and merge
  https://github.com/RRTONY/tonygreenberg-website/pull/new/fix/pri-redirect-to-psychedelicreadiness
- [ ] Lifting noindex: still waiting on Sam.

## Status — 2026-11-11

**Done 2026-11-11 (user: "don't wait for anyone"), on `feat/review-completion`:**
- New pages /about, /contact, /privacy, /terms (footer "About" group, sitemap), each with a "last
  reviewed" date (also on /disclaimer). Privacy describes how the site works, checked against the
  code; Terms and About re-use Tony's approved disclaimer text. **Josh should still review them.**
- Interaction guide: MAOIs and MAO-B inhibitors now Hard Stop, matching their own text (the cautious
  direction). Datura, Brugmansia, Sassafras/MDA and Nitrous Oxide show a warning built only from
  sentences already on their cards. **Darryl should still confirm both.**
- Iboga page: the 8-row pharma-alternatives table removed (component and data deleted), like Peyote.
- Not done on purpose: lifting noindex (Sam's approval), tonygreenberg.com → here redirects (would
  move visitors off the fixed tool onto a site on hold), Sam's held items.

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
