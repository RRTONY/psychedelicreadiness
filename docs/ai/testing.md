# Tests (Vitest + Testing Library)

Same setup as tonygreenberg.com (owner's yes there 2026-10-16, and here 2026-10-23 to the dev dependencies: `vitest`, `jsdom`, `@testing-library/react`,
`@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/user-event`; `@vitest/coverage-v8` added the same day). They're dev-only
and never ship to visitors.

```bash
pnpm test:changed              # DEFAULT: only tests affected by files changed vs origin/main,
                               # with coverage (90%) for just those files; seconds, not minutes
pnpm test                      # run everything once: only when asked
pnpm test:watch                # re-run on save
pnpm test:coverage             # everything, plus each src/ file's coverage (fails under 90%)
pnpm exec vitest run __tests__/components/pri   # one folder
```

Needs **Node 24** (the repo's version): Node 22 crashes Vitest's workers with "Cannot read
properties of undefined (reading 'bind')". On this Mac the default `node` is 22, so use
`PATH=~/.nvm/versions/node/v24.18.0/bin:$PATH` (which also puts `pnpm` on the PATH).

**Which to run (owner, 2026-10-17):** for a task, run only what it touched: `pnpm test:changed`,
or the one test file (`pnpm exec vitest run __tests__/lib/admin/tools.test.ts`). Run the whole
suite only when the person asks for it (in chat or through the MCP server). `--changed` follows
imports, so a changed shared file runs every test that imports it, and a change to
`vitest.config.mts`, `__tests__/setup.ts` or `pnpm-lock.yaml` (a dependency) reruns everything
(`forceRerunTriggers`; Vitest's default also reran everything on any `package.json` edit, so a
new script made PR #19's check run all 620 files, about 7.5 minutes on GitHub). Tests run locally
only: GitHub's PR check runs lint and type check, not tests (same as tonygreenberg.com).

## Coverage target: 90% per file

Owner's target (2026-10-16): every file in `src/` has at least 90% of its lines and statements run
by its tests (`thresholds.perFile` in `vitest.config.mts`, provider `@vitest/coverage-v8`).
`pnpm test:coverage` fails and names the file when one drops under. The HTML report is in
`coverage/` (gitignored, not linted). One file:
`pnpm exec vitest run <test> --coverage --coverage.include=<src file> --coverage.reporter=text`
lists the uncovered line numbers. Cover behaviour, not lines: a test that only calls code to push
the number up is worse than none. If a line truly can't be reached (a guard behind a disabled
button), say so instead of contorting the test; a pure helper the data never exercises can be
exported and tested directly (on tonygreenberg.com, `charity-data.ts`'s grade scale is).

## Where tests go

`__tests__/` mirrors `src/`, one test file per source file:

| Source | Test |
| --- | --- |
| `src/lib/utils.ts` | `__tests__/lib/utils.test.ts` |
| `src/components/pri/correction-form.tsx` | `__tests__/components/pri/correction-form.test.tsx` |
| `src/app/facilitator-index/page.tsx` | `__tests__/app/facilitator-index/page.test.tsx` |
| `src/app/(auth)/login/page.tsx` | `__tests__/app/(auth)/login/page.test.tsx` |
| `src/proxy.ts` | `__tests__/proxy.test.ts` |

Use `.test.tsx` whenever the test contains JSX. Import source with `@/...`, test helpers with
`@tests/helpers/...`.

## What's faked for every test (`__tests__/setup.ts`)

No test reads real data, sends an email, or reaches the internet.

- **Next.js:** `next/navigation`, `next/headers`, `next/cache`, `next/image` (plain `<img>`),
  `next/link` (plain `<a>`), `next/script`, `next/dynamic` (renders the real component once loaded:
  use `findBy*`), `next/font/*`. Steer them through `@tests/helpers/next`:
  `navigation.pathname`, `navigation.searchParams`, `navigation.params`, `navigation.router.push`,
  `cookieJar`, `headerJar`. `notFound()` throws `NEXT_NOT_FOUND`; `redirect(url)` throws
  `NEXT_REDIRECT:<url>`.
- **Email:** `sendEmail` from `@/lib/email` is a stub that returns `true` (`esc` is real).
- **`server-only`** is an empty module.
- **`fetch`** is blocked: an unstubbed call throws. Stub it per test with
  `vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(...))))`.
- jsdom gaps filled: `IntersectionObserver`, `ResizeObserver`, `matchMedia`, `scrollTo`,
  `scrollIntoView`, pointer capture, canvas `getContext` (returns null).
- localStorage, sessionStorage and `document.cookie` are cleared after every test.

**Gotcha:** `mockReset` runs before every test, so every `vi.fn()` goes back to the behaviour it
was created with. Set per-test behaviour (`mockResolvedValue`, `mockReturnValue`) inside the test or
a `beforeEach`, never at the top level of the file, or it only applies to the first test.

**Gotcha:** always give `beforeEach` braces: `beforeEach(() => { mock.mockResolvedValue(x); })`.
Without them the arrow returns the mock, Vitest treats a returned function as clean-up and calls it
after the test, and a test that switched the mock to reject or hang then fails or times out for
no visible reason.

**Gotcha:** Never build a fake
module from a `Proxy`: it answers `then` (so importing it hangs forever) and Vitest can't see its
named exports. The `next/font/google` fake lists every font the site uses (`GOOGLE_FONTS` in
`__tests__/helpers/next.tsx`): add a new face there when the site starts using one.

## Patterns

**Async Server Component page:**

```tsx
import { renderServer, pageProps } from "@tests/helpers/render";
await renderServer(Page(pageProps({ slug: "five-cups" })));
expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Five Cups");
await expect(Page(pageProps({ slug: "missing" }))).rejects.toThrow("NEXT_NOT_FOUND");
const meta = await generateMetadata(pageProps({ slug: "five-cups" }));
```

**Form:** fill it in with `userEvent`, check the error messages, check exactly what the submit
handler or server action receives, and check the success and failure states. Mock the server action
module in the form's test; test the server action itself (validation, what it saves, the email it
sends) in its own test file. Reference: `__tests__/components/pri/correction-form.test.tsx` and
`__tests__/app/forms/actions.test.ts`.

**Quiz / step flow:** answer every question through the UI, check the progress, back button and
reset, and that the result matches the scoring logic (test the scoring function directly too).

Quizzes that move on by themselves after a pause (none here yet; on tonygreenberg.com: coffee, mirror): use
`vi.useFakeTimers({ shouldAdvanceTime: true })` with `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`.
On very long walk-throughs, `getByRole` gets slow; `getByText` or a plain DOM lookup is much
faster.

**Route handler:** build a `new Request(url, { method, headers, body })`, call `GET`/`POST`, and
check the status code and JSON. Cover the unauthorised and bad-input cases.

**Data module (`src/lib/content/*`):** integrity checks: unique ids/slugs, required fields present
and non-empty, internal links start with `/`, no Manus URLs (`manuscdn`, `/manus-storage/`,
`/api/img/`), cross-references point at entries that exist, and any helper functions it exports.

**Static page:** metadata (title, description, canonical), exactly one H1, a few lines of the real
copy, and the main links' `href`s.

**Type-only file:** `expectTypeOf` checks on the exported types.

No snapshot tests: they break on every copy change and prove nothing about behaviour.

## When a test finds a real bug

Don't change `src/` from inside a test pass. Write the test for the correct behaviour as
`it.fails("BUG: <what's wrong>", ...)` so the suite stays green while the bug is recorded, and list
it in `PROJECT-STATUS.md`. When the bug is fixed, the `it.fails` starts failing: switch it
to `it`.

An `it.fails` passes on *any* error, including a broken test (on tonygreenberg.com one failed on "Found
multiple elements", not on the bug). When you write one, run it once as `it` and check it fails
on the assertion that describes the bug. When you fix the bug, do the same before touching `src/`.
