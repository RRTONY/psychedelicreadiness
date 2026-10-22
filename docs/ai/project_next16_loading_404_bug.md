# Root loading.tsx turned every missing page into HTTP 200

> Fixed 2026-09-29. A loading.tsx wraps its folder and every route below it in a Suspense boundary, so notFound()/redirect() in any nested dynamic route can no longer set a real status code.

**What was wrong:** `src/app/loading.tsx` (a generic shadcn `Skeleton` page) sat at the root, so
it wrapped *every* route. Checked on a production build (`pnpm start`), with both a browser and a
Googlebot user agent, every invalid dynamic URL returned **200** with a `noindex` meta tag instead
of **404**: `/blog/<bad-slug>`, `/blog/category/<bad>`, `/charity-scorecard/<bad>`,
`/brewsoul/cities/<bad>`, `/brewsoul/coffee/<bad>`, `/path/<bad>`. Crawlers see these as "soft
404s". Only fully unmatched URLs (`/totally-missing-page`) returned a real 404.

**Why (Next.js 16 docs, `02-guides/streaming.md` "The HTTP contract"):** once a Suspense fallback
renders, the server commits to `200 OK` to start streaming. A `notFound()` that fires afterwards
can only inject `<meta name="robots" content="noindex">`, and a `redirect()` becomes a client-side
redirect. A folder-level `loading.tsx` creates that fallback for its whole subtree.

**Fix:** deleted `src/app/loading.tsx`. Nothing else used it. Verified on a fresh production
build: all six invalid URLs now return 404, and real posts, charities and pages still return 200.
Same root cause and fix ramprate-ui hit on 2026-08-10 (its `blog/loading.tsx`).

**How to apply:**
- Never add a `loading.tsx` to a folder with a dynamic `[slug]` route anywhere below it,
  including the root. For a loading skeleton, wrap just that page's slow part in a local
  `<Suspense fallback={<Skeleton ... />}>` inside the page. It doesn't leak into other routes.
- Call `notFound()`/`redirect()` before anything that suspends.
- Test status codes with `curl -I` against `pnpm build && pnpm start`, and confirm with
  `lsof -iTCP:3000` that port 3000 is really the new build. During this fix a stale
  `next-server` from an earlier run kept answering and made the fix look like it hadn't worked
  (`pkill -f "next start"` doesn't match it, because the process renames itself `next-server`).
