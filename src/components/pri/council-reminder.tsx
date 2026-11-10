import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COUNCIL_REMINDER, DISCLAIMER_PATH } from "@/lib/content/pri-disclaimer";

// The "Talk to your psychedelic council" reminder (owner-approved 2026-11-11). Shown on every
// assessment screen, the medicine profile and the printed report. `tone` matches the section
// it sits in: "dark" on the ink assessment band, "light" on parchment (the profile), "print"
// in the report, where a link can't be clicked so the full address is written out.
const TONE = {
  dark: {
    box: "border-pri-purple-light/30 bg-pri-purple/12",
    title: "text-pri-purple-light",
    body: "text-pri-cream/75",
    link: "text-pri-purple-light hover:text-pri-cream",
  },
  light: {
    box: "border-pri-purple/25 bg-pri-purple/6",
    title: "text-pri-purple",
    body: "text-pri-brown",
    link: "text-pri-purple hover:text-pri-ink",
  },
  print: {
    box: "border-[#E8E0D6] bg-[#F3EEF6]",
    title: "text-pri-purple",
    body: "text-[#5D4E3C]",
    link: "text-pri-purple",
  },
} as const;

export function CouncilReminder({ tone = "dark", className = "" }: { tone?: keyof typeof TONE; className?: string }) {
  const t = TONE[tone];
  return (
    <aside aria-label="Reminder" className={`break-inside-avoid border px-5 py-4 ${t.box} ${className}`}>
      <p className={`mb-1 text-[.95rem] font-bold ${t.title}`}>{COUNCIL_REMINDER.title}</p>
      <p className={`mb-2 text-[.82rem] leading-[1.55] ${t.body}`}>{COUNCIL_REMINDER.body}</p>
      {tone === "print" ? (
        <p className={`text-[.78rem] font-bold ${t.link}`}>
          {COUNCIL_REMINDER.link}: psychedelicreadiness.com{DISCLAIMER_PATH}
        </p>
      ) : (
        <Link href={DISCLAIMER_PATH} className={`inline-flex items-center gap-1.5 text-[.8rem] font-bold underline underline-offset-2 ${t.link}`}>
          {COUNCIL_REMINDER.link}
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      )}
    </aside>
  );
}
