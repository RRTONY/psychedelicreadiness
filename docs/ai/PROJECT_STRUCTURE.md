# Project Structure

Where everything lives. Rules: [`/CONTRIBUTING.md`](../../CONTRIBUTING.md). How to handle a
request: [`TASK_GUIDE.md`](TASK_GUIDE.md).

## Pages (`src/app/`)

| Address | File | What it is |
| --- | --- | --- |
| `/` | `page.tsx` → `components/pri/psychedelic-readiness-index.tsx` | The Psychedelic Readiness Index: consent gate, 50+ questions, results, 39-medicine encyclopedia, printable report (`pri-report.tsx`) |
| `/pri-calibration` | `pri-calibration/page.tsx` → `components/pri/calibration-assessment.tsx` | Forced-rank Deep Calibration (pairwise + ranking). Not saved anywhere |
| `/pri-efficacy` | `pri-efficacy/page.tsx` | Monte Carlo validation report (`lib/content/pri-efficacy-data.json`) |
| `/medicine-sequencing` | `medicine-sequencing/page.tsx` → `components/pri/medicine-sequencing-ladder.tsx` | The Medicine Sequencing Ladder |
| `/iboga-ibogaine` | `iboga-ibogaine/page.tsx` | Iboga vs ibogaine deep dive (+ Compass section) |
| `/iboga-compass` | `iboga-compass/page.tsx` → `components/pri/iboga-compass-assessment.tsx` | Facility-matching assessment |
| `/peyote-mescaline` | `peyote-mescaline/page.tsx` | Mescaline / peyote / San Pedro deep dive |
| `/facilitator-index` | `facilitator-index/page.tsx` → `components/facilitator/*` | The Facilitator Index (108 items, Quick Intake, print sheet) |
| `/psychedelic-readiness-index`, `/pri` | `next.config.ts` redirects | 308 to `/` |
| `/sitemap.xml`, `/robots.txt` | `sitemap.ts`, `robots.ts` | From `lib/site-nav.ts` |
| share image, tab icon | `opengraph-image.tsx`, `icon.svg` | Same gauge mark as `components/logo-mark.tsx` |
| `/oauth/authorize`, `/api/mcp`, `/api/oauth/*`, `/.well-known/*` | MCP server | See [`project_mcp_server.md`](project_mcp_server.md) |

## Site chrome

- `src/app/layout.tsx`: fonts (Playfair Display, Source Sans 3, DM Mono), metadata, WebSite JSON-LD.
- `src/components/site-header.tsx` + `site-mobile-menu.tsx` (below `lg`), `site-footer.tsx`,
  `site-chrome.tsx` (hides them on `/oauth`), `logo-mark.tsx`.
- `src/lib/site-nav.ts`: every page, used by the header, menu, footer and sitemap.
- `src/app/globals.css`: Tailwind v4 theme and tokens (`pri-*`, `facilitator-*`, `brand-gold*`).

## Data (`src/lib/content/`)

| File | Holds |
| --- | --- |
| `pri-data.ts` | Medicines, questions, dimensions, MAO-B and medication interactions, crisis resources |
| `pri-shared.ts` | Scoring (`computeScores`), readiness levels, healing sequence, tag colours |
| `pri-safety-data.ts` | Per-medicine safety sheets |
| `pri-medicine-images.ts` | Medicine photos (Sanity CDN URLs) |
| `pri-iboga-module.ts`, `pri-mescaline-module.ts` | Deep-dive page data |
| `pri-iboga-compass-data.ts`, `pri-iboga-compass-engine.ts`, `pri-iboga-facility-data.ts` | Iboga Compass questions, matching engine, facility directory |
| `pri-efficacy-data.json` | Simulation results |
| `facilitator-index-data.ts` | Facilitator Index bands and items |

## Server code

- `src/app/forms/actions.ts`: PRI consent (checked only), correction suggestions and Facilitator
  Index submissions (emailed to Tony).
- `src/lib/email.ts`: Resend sender (`RESEND_API_KEY`).
- `src/lib/admin/*`: the MCP server.

## Outside systems

| System | Used for | Set up? |
| --- | --- | --- |
| GitHub `RRTONY/psychedelicreadiness` | Code, pull requests, MCP change records (`mcp-state` branch) | Not yet created |
| Netlify | Hosting, deploy previews | Not yet created |
| Resend | Form emails | Uses tonygreenberg.com's verified sender until a psychedelicreadiness.com one is added |
| Sanity CDN (`a3q1cyqs`) | Images only (read) | Yes, tonygreenberg.com's project |
| DNS for psychedelicreadiness.com | The domain | Owner |

## Tests and tooling

`__tests__/` mirrors `src/` (see [`testing.md`](testing.md)). `.claude/agents/pri-task-planner.md`
plans a request; `.claude/skills/verify-change` runs the checks. `.github/workflows/pr-lint.yml`
lints changed files and type checks every pull request.
