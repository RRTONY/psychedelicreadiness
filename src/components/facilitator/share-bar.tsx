"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { FacebookIcon, LinkedinIcon, XIcon } from "@/components/icons/brand-icons";

// Ported from legacy's `ShareBar` — real social/copy/email share intents.
// Legacy's share URL pointed at the stale `onlytimebuystrust.com` domain
// — corrected to this site's real canonical domain, same fix already
// applied to the main PRI page's share bar. `XIcon`/`LinkedinIcon`/
// `FacebookIcon` are local inline-SVG components (`components/icons/
// brand-icons.tsx`), not a second icon package — lucide-react (this
// project's one icon package everywhere else) dropped its bundled
// Twitter/Facebook/LinkedIn brand marks a while back, so these three fill
// that gap without adding a dependency; `Mail`/`Copy`/`Check` below are
// real lucide-react icons since those exist in the set.
const SHARE_URL = "https://psychedelicreadiness.com/facilitator-index";
const SHARE_TEXT = "The Facilitator Index — a philosophy-first instrument for practitioners who hold non-ordinary states.";

const BTN_CLASS = "flex items-center gap-1.5 rounded-lg border border-facilitator-amber-light/28 bg-facilitator-amber-light/10 px-4.5 py-2 text-[.82rem] text-facilitator-ink/80 no-underline";

export function FacilitatorShareBar() {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(SHARE_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mb-8 rounded-2xl border border-facilitator-amber-light/28 bg-white/82 p-6 shadow-[0_8px_32px_rgba(180,120,0,0.12),0_2px_8px_rgba(0,0,0,.06)] backdrop-blur-2xl">
      <div className="mb-4 font-heading text-[1.05rem] font-bold text-facilitator-ink">Share This Instrument</div>
      <div className="flex flex-wrap gap-3">
        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`} target="_blank" rel="noopener noreferrer" className={BTN_CLASS}>
          <XIcon className="size-3.5" /> X / Twitter
        </a>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`} target="_blank" rel="noopener noreferrer" className={BTN_CLASS}>
          <LinkedinIcon className="size-3.5" /> LinkedIn
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`} target="_blank" rel="noopener noreferrer" className={BTN_CLASS}>
          <FacebookIcon className="size-3.5" /> Facebook
        </a>
        <a href={`mailto:?subject=${encodeURIComponent("The Facilitator Index")}&body=${encodeURIComponent(SHARE_TEXT + "\n\n" + SHARE_URL)}`} className={BTN_CLASS}>
          <Mail className="size-3.5" /> Send by Email
        </a>
        <button onClick={copyLink} className={BTN_CLASS}>
          {copied ? (
            <>
              <Check className="size-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
