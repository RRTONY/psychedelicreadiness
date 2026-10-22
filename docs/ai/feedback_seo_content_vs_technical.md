# SEO: copy vs. technical fixes

> SEO audit findings about copy (titles, descriptions, keywords, positioning) need the owner's yes. Technical fixes don't. Verify every audit claim before acting.

Carried over from ramprate-ui: a homepage title/description rewrite made because an audit called
it "too generic" was reverted by the owner. The wording was a deliberate positioning choice the
audit couldn't know about. In the same session, several audit findings turned out to be wrong on
direct checking (a "regressed" link that never regressed, "thin content" that was really a
collapsed-tab crawlability bug, "no named specialists" on a page that had three).

**How to apply:**
- Ask first: live `<title>`, meta description, keywords, H1 wording, on-page positioning copy.
  On this site, ported copy should also match the legacy source (`ROUTES-INVENTORY.md`), so an
  audit-driven rewrite is a deviation that needs a yes.
- Fix directly: canonicals, HTTP status codes, sitemap/robots, schema/JSON-LD, heading order,
  contrast, tap targets, dead links, content missing from the server HTML (`forceMount`).
- Before trusting "X is missing/broken", check it yourself: `curl` the page (production build or
  the deployed site), `grep` the component.
