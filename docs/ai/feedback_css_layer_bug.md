# Unlayered CSS beats Tailwind v4 utilities

> Any element rule in globals.css outside an @layer silently overrides Tailwind utility classes, regardless of specificity. Put resets in @layer base.

Carried over from ramprate-ui (2026-08-11): `a { color: inherit }` at the top of `globals.css`,
outside any layer, overrode every Tailwind text-color class on every link. The header nav links
went invisible while the sibling `<button>` looked fine. Tailwind v4's own styles live in cascade
layers, and per the CSS spec unlayered rules beat all layered ones.

**Checked on this repo 2026-09-29:** clean. `src/app/globals.css` has its element resets inside
`@layer base`. The only unlayered rule is the deliberate class-based drop cap
(`.article-body > p:first-of-type::first-letter`).

**2026-09-30:** added one deliberate override inside `@layer utilities` (not unlayered): phone-width
form fields with a small text class get 16px so iPhone Safari doesn't zoom on tap. It wins over
`.text-sm` by specificity within the layer, not by being unlayered.

**How to apply:** any new global *element* selector (`a`, `h1`, `body`, `*`) goes inside
`@layer base { }`. If a Tailwind class silently "does nothing", look for an unlayered rule winning
the cascade before assuming the class wasn't generated.
