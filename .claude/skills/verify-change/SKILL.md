---
name: verify-change
description: Run this repo's "check before calling anything done" steps on the current changes (type check, lint, Manus-URL grep, production build and route table, fresh server on port 3000, status codes and server-HTML checks for the changed pages). Use before saying a psychedelicreadiness.com change is done, or when asked to "test", "verify" or "check everything".
---

# Verify a change (psychedelicreadiness.com)

The runnable version of CONTRIBUTING.md "Testing & Before You Publish". Run every step, in order,
and report each one as passed / failed (with the output) / skipped (and why). Never call a change
done on a step you didn't run.

## 1. What changed

```bash
git status --short && git diff --stat
```

Note the changed routes (`src/app/<route>/page.tsx` → `/<route>`) and any shared component, since
a shared component means every page that renders it needs checking.

## 2. Static checks

```bash
pnpm typecheck
pnpm lint            # or: pnpm exec eslint <changed files>
pnpm test:changed    # Vitest, only tests for what changed (+ coverage for those files); full `pnpm test` only if asked
grep -rn "manuscdn\|manus-storage\|/api/img/" src public   # must print nothing
```

Also look over the diff for the house rules lint can't catch: `style={}` (only a runtime number is
allowed), `<img>`, framer-motion, class names built from fragments, `"use client"` without a
reason, `loading.tsx` above a dynamic route, a new file nothing imports.

## 3. Production build

Needed for anything touching routing, metadata, config or styles.

```bash
pnpm build
```

Check the route table: every page should be `○ (Static)`; only `/api/*`, `/oauth/authorize` and
`/.well-known/*` (the MCP server) are `ƒ (Dynamic)`. A page that turned dynamic means a
`headers()`/`cookies()` call crept into shared code.

## 4. A fresh server on port 3000

A stale `next-server` has answered instead of the new build before. Stop it first:

```bash
pkill -f next-server; pkill -f "next start"
pnpm start &          # run in the background
lsof -iTCP:3000 -sTCP:LISTEN   # one fresh process, started after the build
```

Never judge a page from `pnpm dev`.

## 5. The real pages

For every changed route (and a sample of pages using a changed shared component):

```bash
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/<route>   # 200
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/not-a-real-page   # must be 404
curl -sI localhost:3000/<old-url> | head -3   # redirects: 308 and the right Location
curl -s localhost:3000/<route> | grep -c "<h1"   # exactly one H1
curl -s localhost:3000/<route> | grep -o "<title>[^<]*</title>"
```

Content inside accordions or tabs must be in that raw HTML (`forceMount`): grep for a sentence
from inside a collapsed panel.

Look at the page at 375px and 1280px wide (a browser, or a screenshot tool if one is available):
no sideways scroll, nothing cropped, tap targets at least 44px on phones. For a "match the source" change,
compare against the same page on https://tonygreenberg.com at the same widths.

## 6. Report

Fill the Status Report's **Checks** lines from what actually ran. List anything skipped under
**Still pending**. Then update `PROJECT-STATUS.md` (the items you finished, with the date and what was
verified, plus the "Current status" block).
