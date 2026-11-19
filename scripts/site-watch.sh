#!/usr/bin/env bash
# Daily site watch for psychedelicreadiness.com and tonygreenberg.com (2026-11-20).
# Replaces the hand-run "site-watch report": every expectation below is a decision already made
# (see PROJECT-STATUS.md), so a failure means something changed that nobody meant to change.
# Runs from .github/workflows/site-watch.yml every morning; run it by hand with
#   bash scripts/site-watch.sh
# Exit 1 if any check fails. If a decision changes (e.g. the 307s become 301s, or noindex is
# lifted), update the expectation here in the same change.
set -u

PR="https://psychedelicreadiness.com"
TG="https://tonygreenberg.com"
OUT="${GITHUB_STEP_SUMMARY:-/dev/stdout}"
fails=0
lines=()

ok()   { lines+=("| ok | $1 | $2 |"); }
bad()  { lines+=("| **FAIL** | $1 | $2 |"); fails=$((fails + 1)); }
info() { lines+=("| info | $1 | $2 |"); }

# expect URL STATUS [REDIRECT_TARGET]: status (and, for redirects, the exact target) of one hop.
expect() {
  local url="$1" want="$2" target="${3:-}" got
  got=$(curl -s -o /dev/null --max-time 30 -w "%{http_code} %{redirect_url}" "$url")
  local code="${got%% *}" loc="${got#* }"
  if [ "$code" = "$want" ] && { [ -z "$target" ] || [ "$loc" = "$target" ]; }; then
    ok "$url" "$code${loc:+ → $loc}"
  else
    bad "$url" "got $code${loc:+ → $loc}, expected $want${target:+ → $target}"
  fi
}

# page_has URL TEXT / page_lacks URL TEXT: the server HTML does (or doesn't) contain TEXT.
page_has() {
  if curl -s --max-time 30 "$1" | grep -q "$2"; then ok "$1" "shows \"$2\""; else bad "$1" "missing \"$2\""; fi
}
page_lacks() {
  if curl -s --max-time 30 "$1" | grep -q "$2"; then bad "$1" "should not show \"$2\""; else ok "$1" "no \"$2\""; fi
}

# --- psychedelicreadiness.com -------------------------------------------------------------
expect "$PR/" 200
expect "$PR/no-such-page-site-watch" 404
expect "$PR/psychedelic-readiness-index" 308 "$PR/"
expect "$PR/medicine" 308 "$PR/"
expect "$PR/heroes" 308 "$TG/the-territory"
# Safety: Tony's emergency holds (ibogaine, and the 14 medicines with no reviewed safety data).
page_has "$PR/?m=ibogaine" "Temporary safety hold"
page_has "$PR/?m=kanna" "Temporary safety hold"
page_lacks "$PR/?m=psilocybin" "Temporary safety hold"
if curl -sI --max-time 30 "$PR/" | grep -qi "x-robots-tag: noindex"; then
  bad "$PR/" "hidden from Google (noindex) again; it was lifted on 2026-11-20"
else
  ok "$PR/" "visible to Google (no noindex)"
fi

# --- tonygreenberg.com: the PRI pages moved here (permanent 308 since noindex was lifted on
# 2026-11-20, tonygreenberg-website fix/search-console-redirects; query kept) ----------------
expect "$TG/psychedelic-readiness-index" 308 "$PR/"
expect "$TG/psychedelic-readiness-index?m=ibogaine" 308 "$PR/?m=ibogaine"
expect "$TG/iboga-ibogaine" 308 "$PR/iboga-ibogaine"
expect "$TG/medicine" 308 "$PR/"
expect "$TG/psychedelic-readiness-index/calibration" 308 "$PR/pri-calibration"
expect "$TG/heroes" 308 "$TG/the-territory"
expect "$TG/pri-research" 200
expect "$TG/the-territory" 200
expect "$TG/no-such-page-site-watch" 404

# --- Every sitemap page on both sites loads ------------------------------------------------
tmp=$(mktemp -d)
for site in "$PR" "$TG"; do
  curl -s --max-time 30 "$site/sitemap.xml" | grep -o "<loc>[^<]*</loc>" | sed 's/<[^>]*>//g' > "$tmp/urls"
  total=$(wc -l < "$tmp/urls" | tr -d ' ')
  if [ "$total" -eq 0 ]; then bad "$site/sitemap.xml" "no pages listed"; continue; fi
  xargs -P 8 -n 1 curl -s -o /dev/null --max-time 30 -w "%{http_code} %{url_effective}\n" < "$tmp/urls" \
    | awk '$1 != 200' > "$tmp/broken"
  if [ -s "$tmp/broken" ]; then
    bad "$site/sitemap.xml" "$(wc -l < "$tmp/broken" | tr -d ' ') of $total pages not 200: $(head -5 "$tmp/broken" | tr '\n' ';')"
  else
    ok "$site/sitemap.xml" "all $total pages load"
  fi
done
rm -rf "$tmp"

{
  echo "## Site watch $(date -u '+%Y-%m-%d %H:%M UTC'): $([ "$fails" -eq 0 ] && echo "all clear" || echo "$fails problem(s)")"
  echo
  echo "| Result | Address | Detail |"
  echo "| --- | --- | --- |"
  printf '%s\n' "${lines[@]}"
} >> "$OUT"

[ "$fails" -eq 0 ]
