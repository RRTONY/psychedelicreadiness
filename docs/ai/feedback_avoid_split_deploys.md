# Avoid Split Deploys

> Keep one feature's logic in one deployed place (rule carried over from ramprate-ui, 2026-10-23)

When a feature's logic would be split across two separately deployed pieces (for example a script
that computes something and posts it to a separately deployed service, so someone has to run one
and redeploy the other), collapse it into a single deployable piece instead.

**Why:** on ramprate-ui (2026-07-14) the supplier-intake scoring lived half in a Python script and
half in a Google Apps Script. The complaint was the overhead of saving and deploying twice, not a
bug in either file. Once scoring moved fully into one place, the leftover script was deleted.

**How to apply:** default to putting the logic in the one live artifact (here, the Next.js app).
When bringing split logic together, also clean up the now-dead references (docs, comments, env
vars) that point at the removed piece.
