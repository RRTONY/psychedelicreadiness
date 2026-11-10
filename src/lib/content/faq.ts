import {
  COUNCIL_REMINDER,
  NOT_A_DOCTOR,
  SCORE_CAN_TELL,
} from "./pri-disclaimer";
import { CRISIS_RESOURCES, SCORE_PROFILES } from "./pri-data";
import { PRIVACY } from "./site-pages";

// The /faq page (2026-11-11). Questions are about how the Index works, not about any substance.
// Every answer is either Tony's approved text (pri-disclaimer.ts, SCORE_PROFILES) or a fact about
// how the site behaves, checked against the code. Keep it that way: medical answers need the
// clinical reviewer. The same list feeds the page and its FAQPage structured data.

const anyRed = SCORE_PROFILES.find((p) => p.label === "Any Red")!.meaning;
const answersPrivacy = PRIVACY.sections.find(
  (s) => s.title === "Your assessment answers",
)!.paragraphs![0];

export type FaqItem = { question: string; answer: string };

export const FAQ: readonly FaqItem[] = [
  {
    question: "What is the Psychedelic Readiness Index?",
    answer: `A free assessment by Tony Greenberg: 50+ readiness questions across 6 domains, and profiles of 39 substances. ${SCORE_CAN_TELL.paragraphs[0]}`,
  },
  {
    question: "Is this medical advice?",
    answer: `No. ${NOT_A_DOCTOR.before}${NOT_A_DOCTOR.strong}${NOT_A_DOCTOR.after}`,
  },
  {
    question: "Who should I talk to about my results?",
    answer: `${COUNCIL_REMINDER.title} ${SCORE_CAN_TELL.paragraphs[1]}`,
  },
  {
    question: "Why is my score paused?",
    answer: `Some questions are safety screens, such as heart history, seizures, certain medications and mental-health history. If you answer one of them below "Often true", the Index does not show a score or medicine matches. Instead it lists those answers so you can take them to a clinician. ${anyRed}`,
  },
  {
    question: "Do I have to answer every question?",
    answer:
      "Yes. Each question needs an answer before you can move on, and a personal result is only shown once every question is answered.",
  },
  {
    question: "Are my answers stored?",
    answer: `${answersPrivacy} The Privacy page has the details.`,
  },
  {
    question: "Can I save my results?",
    answer:
      'Yes. "Save My Results" opens your browser\'s print window, where you can print the report or save it as a PDF. Medicines you save with the heart button stay in your browser on that device.',
  },
  {
    question:
      "I found an error in a medicine's information. How do I report it?",
    answer:
      'Open that medicine and use "Suggest Correction". It goes straight to Tony with the exact section.',
  },
  {
    question: "What if I need help right now?",
    answer: `This site can't respond to emergencies. Contact one of these services: ${CRISIS_RESOURCES.map((r) => `${r.name}, ${r.contact}`).join("; ")}. The Contact page lists them too.`,
  },
];
