// Copy for the About, Contact, Privacy and Terms pages (2026-11-11). The Privacy page describes
// how the site works today, checked against the code: no database, no cookies, no analytics,
// answers scored in the browser, and the forms in `src/app/forms/actions.ts`. If any of that
// changes (a database, analytics, a new form), update this page in the same change.
// Terms and About re-use Tony's approved disclaimer text from `pri-disclaimer.ts`. Josh (legal)
// is to review the wording; nothing here adds a new legal or medical claim.

export const LAST_REVIEWED = "11 November 2026";
export const CONTACT_EMAIL = "tony@tonygreenberg.com";

export type PageSection = { title: string; paragraphs?: readonly string[]; items?: readonly string[] };

export const PRIVACY = {
  intro:
    "This page explains what psychedelicreadiness.com does with information when you use it. It describes how the site works today.",
  sections: [
    {
      title: "Your assessment answers",
      paragraphs: [
        "Your answers to the readiness questions and the “How You Want to Go” questions are scored in your own browser. They are not sent to us, saved on a server or shared with anyone. They are gone when you close or reload the page.",
      ],
    },
    {
      title: "The disclaimer and your initials",
      paragraphs: [
        "When you accept the disclaimer, our server checks that you typed at least two letters. Your initials are not saved or sent anywhere. Your browser remembers that you accepted until you close the tab (session storage).",
      ],
    },
    {
      title: "Saved medicines",
      paragraphs: [
        "Medicines you save with the heart button are kept only in your browser on that device (local storage). We never receive the list. Clearing your browser data removes it.",
      ],
    },
    {
      title: "Forms that send us information",
      paragraphs: ["Information reaches us only when you submit one of these forms:"],
      items: [
        "Suggest a Correction: the medicine and section, your suggested text, an optional source link, and your name and email if you give them are emailed to Tony Greenberg.",
        "Facilitator Index: your pasted responses, an optional code name and archetype, and, if you ask for an introduction, your region and contact details are emailed to Tony Greenberg.",
        "The Iboga Compass email buttons open your own email app with a message filled in. Nothing is sent unless you send it yourself.",
      ],
    },
    {
      title: "How form emails are kept",
      paragraphs: [
        "Form emails are delivered by our email provider, Resend. The site has no database, so the email is the only record of a submission.",
      ],
    },
    {
      title: "Cookies, analytics and tracking",
      paragraphs: ["The site sets no cookies and uses no analytics, advertising or tracking scripts."],
    },
    {
      title: "Services that see your visit",
      items: [
        "Netlify hosts the site. Like any web host, it processes technical request data, such as your IP address, to deliver pages.",
        "Images load from Sanity's image service (cdn.sanity.io).",
        "Links to other websites, such as shops or providers, take you to sites with their own privacy policies.",
      ],
    },
  ] satisfies readonly PageSection[],
} as const;

export const CONTACT = {
  intro: "Questions, corrections or anything else about the Psychedelic Readiness Index: email Tony Greenberg.",
  correction:
    "Found an error in a medicine's information? Open that medicine and use “Suggest Correction”. It goes straight to Tony with the exact section.",
  crisisTitle: "If you need help now",
  crisisIntro: "This site can't respond to emergencies. If you or someone with you is in crisis, contact one of these services:",
} as const;
