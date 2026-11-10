// The PRI disclaimer, in one place. The consent pop-up (`disclaimer-gate.tsx`), the full
// disclaimer page (`/disclaimer`) and the "Talk to your psychedelic council" reminder all read
// from here, so the wording can't drift between them.
//
// Owner-approved 2026-11-11 (PRI scoring review of 7 Nov 2026): the council reminder, the
// "What the score can tell you" section, and the second "What This Is" bullet, which replaces
// "Not anonymous internet advice. Every data point in here has been cross-referenced against
// clinical trials, harm reduction databases, and people who have actually sat with these
// medicines professionally." Everything else is Tony's original text, unchanged.

export const DISCLAIMER_PATH = "/disclaimer";

export const COUNCIL_REMINDER = {
  title: "Talk to your psychedelic council.",
  body: "A rough guide from the database. No medical clearance. Review personal risks with a licensed clinician.",
  link: "Read the full disclaimer",
} as const;

export const SCORE_CAN_TELL = {
  title: "What the score can tell you",
  paragraphs: [
    "The index compares your answers with profiles in a curated database. These profiles can bring a question into focus. A score cannot establish safety, predict benefit or harm, diagnose a condition, or tell you which substance or dose to take.",
    "Talk to your psychedelic council, the people you trust for support and perspective. Bring medical questions, your health history and your full medication list to a licensed clinician familiar with psychedelics. Discuss any medication change with your prescriber first.",
    "Profiles and research can be incomplete. The same score can describe people with very different risks. The index offers neither medical clearance nor a diagnosis.",
  ],
} as const;

export const TONY_NOTE = {
  title: "A Note from Tony Greenberg",
  quote:
    "Here is what I want you to know before you go one click further. Most of these medicines I have never touched. Some of them I probably never will. What I have done is spent the better part of three decades watching this field from the inside... the researchers, the healers, the disasters, the quiet miracles that never made the news. This index is a synthesis of all of that. It exists because I have seen what happens when someone walks into a ceremony with no map and no container and no one who actually knows what they are doing. This is the map. Where you go from here is completely and entirely up to you.",
  byline: "Tony Greenberg, Impact Futurist & Investor in Consciousness Medicine",
} as const;

export const NOT_A_DOCTOR = {
  title: "Not a Doctor. Not a Dealer. Not Reddit.",
  before:
    "The Psychedelic Readiness Index is built from decades of research, clinical literature, harm reduction work, and conversations with people who have actually been in the room. It is ",
  strong: "not medical advice",
  after: ", not a prescription, and not a substitute for a real conversation with a real healthcare professional who knows your history.",
} as const;

export const WHAT_THIS_IS = {
  title: "What This Is ... And What It Is Not",
  items: [
    "Not a doctor. Not a therapist. Not a shaman. We are none of those things and we are not pretending to be.",
    "The database brings together clinical literature, harm reduction resources and practitioner accounts. The quality and completeness of the evidence vary by entry.",
    "Not a recommendation. Nothing in here says you should do anything. It says here is what is known, here is what the research shows, here is what experienced practitioners report.",
    "A synthesis. Built from clinical literature, DanceSafe, Zendo Project, MAPS, ethnobotanical research, and the kind of conversations that happen when people stop performing and start being honest.",
    "A starting point. Not a finish line. Use this to have better conversations with qualified professionals, not to skip them.",
  ],
} as const;

export const ACKNOWLEDGE = {
  title: "You Acknowledge & Accept",
  items: [
    "This is for education and harm reduction only. Full stop.",
    "Nothing listed here is an endorsement. Not a medicine, not a provider, not a protocol. We are not sending you anywhere.",
    "You will talk to a real healthcare professional before you do anything. That is not optional.",
    "You own your decisions. Every single one of them. We do not.",
    "The people who built this tool assume zero liability for what you do with it. Zero.",
    "Safety data evolves. What is true today may be updated tomorrow. Always verify with current clinical sources.",
    "A lot of what is covered here is illegal in a lot of places. You are responsible for knowing your laws. We are not your lawyer.",
  ],
} as const;

export const LEGAL = {
  title: "Legal disclaimer",
  paragraphs: [
    "The Psychedelic Readiness Index is community-aggregated information compiled for educational and harm reduction purposes only. It does not constitute medical advice, diagnosis, or treatment. No medicine, provider, or protocol listed here constitutes an endorsement or recommendation. Always consult qualified healthcare professionals before engaging with any psychedelic substance. You proceed entirely at your own risk.",
    "The creators, contributors, and operators of this tool assume no liability for any outcomes. Many substances discussed are illegal in various jurisdictions. You are responsible for knowing and following the laws where you live.",
  ],
} as const;

export const CLOSING =
  "This tool exists because the alternative is people going in blind. And that is worse. But information without responsibility is just noise. You have to show up for your own safety.";
