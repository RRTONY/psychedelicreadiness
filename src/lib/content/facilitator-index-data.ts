// Ported from legacy client/src/pages/pri/FacilitatorIndex.tsx — the real
// 108-item, 12-band (plus Band 0) practitioner self-assessment instrument,
// the real 15-question quick-intake archetype engine, and the real
// section images (one confirmed real CloudFront asset; two Manus `/api/img/`
// proxies dropped per this repo's zero-Manus rule — see the page's port
// note in NEXTJS-MIGRATION-TODO.md).
//
// **Real content-drift bug found and resolved**: legacy shipped two
// divergent copies of the same "108 items" — the on-page JSX (rendered via
// `<Item>`/`<Trad>`) and a separate `printFacilitatorQuestions()` function
// that generated a print/PDF window from an entirely different, older set
// of item numbers, band groupings, and even a missing band (the on-page
// version's "Twenty-Five Traditions and Protocols" band doesn't exist at
// all in the print version). The print export was never updated when the
// on-page instrument was revised. This module uses the on-page version —
// the one actually shown to visitors — as the single authoritative source,
// so the ported page's print/PDF feature can never drift from what's
// displayed again.

import { CircleDot, Diamond, Gem, Hexagon, Pentagon, Sparkle, Target, type LucideIcon } from "lucide-react";

export const FACILITATOR_HERO_IMAGE =
  "https://cdn.sanity.io/images/a3q1cyqs/production/5fda5233a00c0cd0161d195de059dd500b85df7e-1920x1072.webp";

// Legacy's two in-body section images, rescued from the Manus /api/img/
// proxy into Sanity on 2026-09-29 (scripts/rescue-facilitator-images.ts).
export const FACILITATOR_BANDS_IMAGE =
  "https://cdn.sanity.io/images/a3q1cyqs/production/710b8c623f37d45a4fbb7b423063116432f3c0ca-1200x805.webp";
export const FACILITATOR_COMPASS_IMAGE =
  "https://cdn.sanity.io/images/a3q1cyqs/production/70c81c5472949bb5d0510149a416bf18a123d2d3-1200x1200.webp";

export interface QuickQuestion {
  id: string;
  band: string;
  q: string;
}

export const QUICK_QUESTIONS: QuickQuestion[] = [
  { id: "q1", band: "Context", q: "How many years have you worked in wellness, therapeutic, contemplative, or care professions?" },
  { id: "q2", band: "Context", q: "Are you currently in supervision, mentorship, peer consultation, or elder guidance?" },
  { id: "q3", band: "Philosophy", q: "Is ongoing personal work an ethical obligation for a guide — or a myth the field tells itself?" },
  { id: "q4", band: "Philosophy", q: "Should a person who guides others be required to have made the journey themselves?" },
  { id: "q5", band: "Philosophy", q: "What percentage of this work, field-wide, should be unpaid or sliding-scale?" },
  { id: "q6", band: "Philosophy", q: "How many people can one guide responsibly serve in a year before quality degrades?" },
  { id: "q7", band: "Temperament", q: "Should there be laughter in a container?" },
  { id: "q8", band: "Temperament", q: "Is a container that ends in dancing less serious than one that ends in silence?" },
  { id: "q9", band: "The Map · Axis 1", q: "Where do you sit on the spectrum from fully emergent (follow the participant) to fully protocolized (follow the structure)?" },
  { id: "q10", band: "The Map · Axis 2", q: "Where do you sit on the spectrum from somatic-first to verbal-first?" },
  { id: "q11", band: "The Map · Axis 3", q: "Where do you sit on the spectrum from spirit-centered to mechanism-centered?" },
  { id: "q12", band: "The Map · Axis 4", q: "Where do you sit on the spectrum from solo container to community container?" },
  { id: "q13", band: "The Map · Axis 5 (Proximity)", q: "Where do you believe a practitioner should physically sit relative to a participant — close presence to maximum distance?" },
  { id: "q14", band: "Container", q: "Does this work require a dedicated space, or is space a luxury the field mistakes for a requirement?" },
  { id: "q15", band: "Container", q: "How important is ritual and ceremony to the container you hold?" },
];

export const SCALE_LABELS: Record<string, [string, string]> = {
  q1: ["0–2 years", "20+ years"],
  q2: ["No, not currently", "Yes, active supervision"],
  q3: ["A myth the field tells itself", "An ethical obligation"],
  q4: ["Not required at all", "Absolutely required"],
  q5: ["0% — market only", "100% — all free"],
  q6: ["5 or fewer per year", "50+ per year"],
  q7: ["Never — not appropriate", "Always — essential"],
  q8: ["Less serious, yes", "Equally serious"],
  q9: ["Fully emergent", "Fully protocolized"],
  q10: ["Somatic-first", "Verbal-first"],
  q11: ["Spirit-centered", "Mechanism-centered"],
  q12: ["Solo container", "Community container"],
  q13: ["Close presence", "Maximum distance"],
  q14: ["Space is essential", "Space is a luxury"],
  q15: ["Not important at all", "Central to everything"],
};

export interface Archetype {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: LucideIcon;
  bands: { label: string; score: number; color: string }[];
}

// Real Bradley-Terry-style axis derivation and archetype matrix, unchanged.
export function deriveArchetype(answers: Record<string, number>): Archetype {
  const get = (id: string) => answers[id] ?? 5;

  const philosophy = Math.round((get("q3") + get("q4") + (10 - get("q5")) + (10 - get("q6"))) / 4);
  const temperament = Math.round((get("q7") + get("q8")) / 2);
  const mapAxis = Math.round((get("q9") + get("q10") + get("q11") + get("q12") + get("q13")) / 5);
  const container = Math.round((get("q14") + get("q15")) / 2);
  const experience = get("q1");
  const supervision = get("q2");

  const bands = [
    { label: "Philosophy", score: philosophy, color: "#B45309" },
    { label: "Temperament", score: temperament, color: "#D97706" },
    { label: "The Map", score: mapAxis, color: "#059669" },
    { label: "Container", score: container, color: "#7C3AED" },
    { label: "Experience", score: experience, color: "#0891B2" },
    { label: "Supervision", score: supervision, color: "#BE185D" },
  ];

  const isStructured = mapAxis >= 6;
  const isSomatic = get("q10") <= 5;
  const isSpirit = get("q11") <= 5;
  const isPhilosophical = philosophy >= 7;
  const isWarm = temperament >= 7;
  const isCommunity = get("q12") >= 6;

  if (isPhilosophical && isSpirit && !isStructured) {
    return {
      title: "The Threshold Keeper",
      subtitle: "Emergent · Spirit-Centered · Philosophical",
      description:
        "You hold space the way a river holds its banks — present, yielding, and quietly shaping everything that moves through you. You believe the work finds its own form. You've probably been told you're too unstructured. You're not. You're calibrated to something most protocols can't measure.",
      color: "#7C3AED",
      icon: Gem,
      bands,
    };
  }
  if (isStructured && !isSpirit && !isSomatic) {
    return {
      title: "The Precision Architect",
      subtitle: "Protocolized · Mechanism-Centered · Verbal",
      description:
        "You bring the rigor the field desperately needs and rarely gets. You've read the research. You've built the container. You know exactly why the set and setting matter and you can defend every choice. The danger is mistaking the map for the territory — but you already know that.",
      color: "#0891B2",
      icon: Hexagon,
      bands,
    };
  }
  if (isSomatic && isWarm && !isStructured) {
    return {
      title: "The Body Oracle",
      subtitle: "Somatic-First · Emergent · Warm Container",
      description:
        "You read the room through the body before the mind has a chance to catch up. You know when someone is bracing before they do. Your work lives in the nervous system — in breath, in posture, in the micro-tremor that says 'I'm not ready yet.' Rare. Necessary. Irreplaceable.",
      color: "#059669",
      icon: CircleDot,
      bands,
    };
  }
  if (isCommunity && isWarm && isPhilosophical) {
    return {
      title: "The Circle Weaver",
      subtitle: "Community Container · Philosophical · High Warmth",
      description:
        "You understand that healing is relational before it is individual. You build the field that makes the work possible — the trust, the ritual, the shared language. You've probably been in more circles than you can count. You know the difference between a group and a container.",
      color: "#BE185D",
      icon: Pentagon,
      bands,
    };
  }
  if (experience >= 7 && supervision >= 7 && isPhilosophical) {
    return {
      title: "The Elder in Motion",
      subtitle: "Seasoned · Supervised · Philosophically Grounded",
      description:
        "You've been doing this long enough to know what you don't know. You stay in supervision not because you have to — because you understand that the work never stops working on the worker. You are the person other practitioners call when something goes sideways.",
      color: "#D97706",
      icon: Target,
      bands,
    };
  }
  if (!isPhilosophical && isStructured && experience <= 4) {
    return {
      title: "The Emerging Technician",
      subtitle: "Protocol-Oriented · Early Career · Building Depth",
      description:
        "You have the structure. Now the field is asking you to develop the philosophy that makes structure meaningful. The best practitioners you'll ever meet will unsettle your certainty — and that's exactly what you need. You're at the most interesting part of the journey.",
      color: "#F59E0B",
      icon: Diamond,
      bands,
    };
  }
  return {
    title: "The Integrative Guide",
    subtitle: "Balanced · Adaptive · Cross-Modal",
    description:
      "You move fluidly between structure and emergence, soma and psyche, solo and community. You resist easy categorization — which is either your greatest strength or the thing you're still working out. Probably both. The field needs more people who can hold the whole map without collapsing it.",
    color: "#B45309",
    icon: Sparkle,
    bands,
  };
}

export interface FacilitatorItem {
  n: number;
  text: string;
}

export interface FacilitatorTradition {
  n: number;
  text: string;
}

export interface FacilitatorBand {
  id: string;
  label: string;
  title: string;
  note?: string;
  items: FacilitatorItem[];
  traditions?: FacilitatorTradition[];
}

export const FACILITATOR_BANDS: FacilitatorBand[] = [
  {
    id: "band-0",
    label: "Band 0",
    title: "Code and Consent",
    items: [
      { n: 1, text: "Keep your assigned code, or choose your own nature word." },
      { n: 2, text: "Select your tier. Sealed, Coded, or Named." },
      { n: 3, text: "Do you understand that a lost code is unrecoverable?" },
      { n: 4, text: "Which bands do you want encrypted so that only you can read them? Select per band, or select all." },
      { n: 5, text: "Do you consent to your anonymized numeric responses appearing in aggregate published findings?" },
      { n: 6, text: "Do you consent to your free-text responses being quoted, attributed to your code only, if you mark them publishable?" },
    ],
  },
  {
    id: "band-a",
    label: "Band A",
    title: "Context",
    note: "Education and identity. Nothing here describes activity.",
    items: [
      { n: 7, text: "How many years have you worked in the wellness, therapeutic, contemplative, pastoral, or care professions, broadly defined?" },
      { n: 8, text: "What formal training, certification, degree, or lineage transmission have you received? Training is education. Naming it admits nothing." },
      { n: 9, text: "Are you currently in supervision, mentorship, peer consultation, or elder guidance? Under what structure?" },
      { n: 10, text: "Which traditions are you conversant in? This asks what you know." },
      { n: 11, text: "In what general region of the world is your work based? Continent level only." },
      { n: 12, text: "What year did you last complete new training?" },
      { n: 13, text: "Do you hold a license, registration, or credential in any adjacent regulated profession?" },
      { n: 14, text: "Have you ever stepped away from this field for longer than six months? What brought you back?" },
    ],
  },
  {
    id: "band-b",
    label: "Band B",
    title: "Philosophy",
    note: "First person, opinion only.",
    items: [
      { n: 15, text: "Why does healing happen? What is your theory of the mechanism?" },
      { n: 16, text: "What is the strongest argument against the work you believe in?" },
      { n: 17, text: "Should a person who guides others be required to have made the journey themselves? Argue your position." },
      { n: 18, text: "Is ongoing personal work an ethical obligation for a guide, a preference, or a myth the field tells itself?" },
      { n: 19, text: "Single molecule or multi-molecule containers. Which asks more of the person holding, and why?" },
      { n: 20, text: "What should a preparation arc contain, at minimum, for the work to be considered responsible?" },
      { n: 21, text: "What should an integration arc contain, at minimum, and over what span?" },
      { n: 22, text: "What is the correct answer when someone is not ready?" },
      { n: 23, text: "Which contemplative, somatic, or therapeutic modalities pair well with non-ordinary states, and which pair badly?" },
      { n: 24, text: "Name three people in this field whose work you admire. What does each understand that the field generally does not?" },
      { n: 25, text: "Should this work be priced at market, on a sliding scale, or given away? Defend your answer against the strongest objection to it." },
      { n: 26, text: "What percentage of this work, field-wide, should be unpaid? Who should receive it?" },
      { n: 27, text: "Which population is most underserved right now, and why has the field failed them?" },
      { n: 28, text: "How many people can one guide responsibly serve in a year before quality degrades? Give a number and defend it." },
      { n: 29, text: "Does this work require a dedicated space, or is space a luxury the field mistakes for a requirement?" },
      { n: 30, text: "What is the most common ethical failure you observe in this field?" },
      { n: 31, text: "What would make you stop?" },
      { n: 32, text: "What do you do with your own grief?" },
    ],
  },
  {
    id: "band-c",
    label: "Band C",
    title: "Temperament and Register",
    items: [
      { n: 33, text: "Should there be laughter?" },
      { n: 34, text: "What does the word sacred mean, in practice? Answer without using the word." },
      { n: 35, text: "Is a container that ends in dancing less serious than one that ends in silence?" },
      { n: 36, text: "Who should choose the music, and what governs the choice?" },
      { n: 37, text: "What belongs in the room? What does not?" },
      { n: 38, text: "What should a person holding wear, and why does the question matter?" },
      { n: 39, text: "Whose language should be used in invocation or prayer, and what is owed to the tradition it comes from?" },
      { n: 40, text: "Ritual elements. Necessary container, useful scaffolding, or ornament the field should shed?" },
      { n: 41, text: "A participant cracks a joke at the peak. What is the right response?" },
      { n: 42, text: "Intervene or let it unfold. Where should a practitioner's default sit, and what moves it?" },
      { n: 43, text: "What should happen when nothing happens?" },
      { n: 44, text: "What is the most annoying quality a good practitioner can have?" },
      { n: 45, text: "Finish this sentence. People come back to a practitioner because ..." },
    ],
  },
  {
    id: "band-d",
    label: "Band D",
    title: "The Map",
    note: "Five axes, one to ten. No midpoint. Plotted against the anonymized cohort so you can see where you land.",
    items: [
      { n: 46, text: "Register. 1 equals solemnity and stillness throughout. 10 equals music, movement, and joy as the medicine itself. Where should this work sit?" },
      { n: 47, text: "Frame. 1 equals spirit, lineage, prayer, cosmology. 10 equals mechanism, receptor, protocol, evidence. Where should the field's center of gravity sit?" },
      { n: 48, text: "Structure. 1 equals emergent and unrepeatable. 10 equals documented protocol with defined phases. What produces better outcomes?" },
      { n: 49, text: "Proximity. 1 equals the practitioner stays at the edge of the room. 10 equals the practitioner stays within arm's reach throughout. What serves the participant?" },
      { n: 50, text: "Policy. 1 equals tightly regulated medical access only. 10 equals full cognitive liberty. Where should the law be? This is a drug policy opinion. Opinions about law are the most protected speech there is." },
      { n: 51, text: "Tolerance. For each of the five above, rate one to ten how much you can respect a practitioner sitting at the opposite pole. Where you sit is a preference. What you can tolerate at the other end is a measurement of character." },
      { n: 52, text: "Which axis have you moved most on in the last five years, and in which direction?" },
      { n: 53, text: "Which axis do you get judged on hardest by others in this field?" },
    ],
  },
  {
    id: "band-e",
    label: "Band E",
    title: "Twenty-Five Traditions and Protocols",
    note: "Four columns per row. None of them ask what you have done.",
    traditions: [
      { n: 1, text: "Shipibo vegetalismo. Amazonian. Icaro as instrument, dieta as apprenticeship, the plant as teacher rather than tool." },
      { n: 2, text: "Santo Daime. Brazilian syncretic church. Hymnal, uniform, collective works, movement in formation." },
      { n: 3, text: "Uniao do Vegetal. Brazilian. Seated, structured, question and answer with the mestre, doctrinal rather than shamanic." },
      { n: 4, text: "Andean huachuma. Day-long, outdoors, walking, mountain-facing, the long slow onset as the point." },
      { n: 5, text: "Mazatec velada. Oaxacan. Nighttime, prayer-led, Catholic and pre-Catholic layered, the curandera speaking throughout." },
      { n: 6, text: "Wixarika pilgrimage. Pilgrimage as the container, the journey to the site inseparable from what happens there." },
      { n: 7, text: "Native American Church tipi meeting. All-night, roadman, water ceremony at dawn, fire tended throughout, sacrament protected by statute for enrolled members." },
      { n: 8, text: "Bwiti initiation. Gabonese. Multi-day, ancestral encounter, communal, initiation into a lineage rather than a session." },
      { n: 9, text: "Ibogaine medical detox. Clinical isolate, cardiac monitoring, telemetry, medical staffing, indication-driven." },
      { n: 10, text: "Kambo. Peptide, purgative, applied in points, non-psychoactive, held within Matsés and Katukina practice and widely adapted outside it." },
      { n: 11, text: "Rapé and sananga. Adjunct practices. Applied by one person to another, brief, intense, used to open or close." },
      { n: 12, text: "Sonoran short-form. Five to twenty minutes, near-total dissolution, one holder, nothing to talk through in the moment." },
      { n: 13, text: "Northern amanita traditions. Siberian, Baltic, and Nordic folk practice. Preparation-dependent, seasonal, deliriant rather than serotonergic." },
      { n: 14, text: "Guatemalan cacao lineage. Heart-opening framing, circle-based, non-psychedelic, increasingly a preparation and integration container." },
      { n: 15, text: "Nakamal kava. Vanuatu and Fiji. Communal, hierarchical, evening-based, sobriety of a particular kind." },
      { n: 16, text: "Temazcal. Mesoamerican sweat. Rounds, heat, darkness, song, used before or after rather than instead of." },
      { n: 17, text: "Holotropic Breathwork. No substance. Paired sitters, extended session, cartography of the psyche, mandala drawing afterward." },
      { n: 18, text: "Dual-therapist MDMA protocol. Two facilitators, non-directive stance, trust in the participant's own inner healing intelligence, extended preparation and integration sessions." },
      { n: 19, text: "Dual-monitor psilocybin trial protocol. Preparation hours, eyeshades, curated playlist, two monitors present throughout, structured follow-up." },
      { n: 20, text: "Ketamine-assisted psychotherapy. Clinic-based, repeated sessions, medical supervision, psychotherapy embedded around the administration." },
      { n: 21, text: "Licensed service-center model. Non-directive by regulation, screening standardised, facilitator scope of practice defined in statute." },
      { n: 22, text: "Psycholytic model. Low dose, repeated, embedded in ongoing psychotherapy over months rather than a single high-dose crossing." },
      { n: 23, text: "IFS-informed integration. Parts language, unburdening, the difficult material treated as protective rather than pathological." },
      { n: 24, text: "Somatic-informed holding. Titration, pendulation, nervous-system tracking, completion of interrupted responses." },
      { n: 25, text: "Structured microdosing protocols. Sub-perceptual, calendared, stacked or unstacked, measured over weeks." },
    ],
    items: [
      { n: 54, text: "Which of these twenty-five has most changed how you think, and what did it change?" },
      { n: 55, text: "Which one do you think the field misunderstands?" },
      { n: 56, text: "Which one is being adapted most carelessly outside its origin, and what is owed to the people it came from?" },
      { n: 57, text: "What tradition or protocol is missing from this list?" },
    ],
  },
  {
    id: "band-f",
    label: "Band F",
    title: "Confidentiality",
    items: [
      { n: 58, text: "Do you believe a practitioner should make a confidentiality commitment? Verbal, written, both, none." },
      { n: 59, text: "How long should it run? Duration of the work, one year, lifetime, beyond death." },
      { n: 60, text: "Should it bind in both directions? May a participant name their practitioner publicly?" },
      { n: 61, text: "What should break it? Click all, or write in. Imminent risk to self, imminent risk to another, disclosure of harm to a child or dependent adult, court order, request from the participant's own clinician with participant consent, nothing at all." },
      { n: 62, text: "Should a practitioner in this field keep notes? If so, for how long, and where?" },
      { n: 63, text: "If a participant asks a practitioner to hold something the practitioner finds morally difficult, what governs?" },
      { n: 64, text: "Should confidentiality extend to co-participants in a group setting? How should it be established, and what happens when it fails?" },
      { n: 65, text: "Where does confidentiality end and complicity begin?" },
    ],
  },
  {
    id: "band-g",
    label: "Band G",
    title: "Container Shape",
    note: "Design preference throughout.",
    items: [
      { n: 66, text: "Which container shapes are you oriented toward? Click all, or write in. One to one, dyad, small group of three to six, circle of seven to twelve, gathering of thirteen to thirty, residential cohort, none of these." },
      { n: 67, text: "Ideal number of participants per person holding. Slider, 1 to 12." },
      { n: 68, text: "Above what number does a container require a second holder?" },
      { n: 69, text: "Preferred arc length for the session itself. Under three hours, three to six, six to ten, ten to sixteen, overnight, multi-day, write in." },
      { n: 70, text: "Preferred preparation arc. Single conversation, two to three meetings, four to six weeks, three months or longer, ongoing relationship with no fixed start, write in." },
      { n: 71, text: "Preferred integration arc. Days, two to four weeks, three months, six months or longer, open-ended, write in." },
      { n: 72, text: "Preferred cadence for someone working over time. Weeks, seasons, annually, once and done, when they ask, write in." },
      { n: 73, text: "Preferred sequence. Click all, or write in. Screening conversation, medical and medication review with a clinician, written agreement, consent conversation covering touch, intention setting, dietary or behavioral preparation, second holder present, morning-after conversation, integration sessions, group integration circle, onward referral, long-term check-in." },
    ],
  },
  {
    id: "band-h",
    label: "Band H",
    title: "Requirements",
    items: [
      { n: 74, text: "What should be required of a participant? Click all, or write in. Medical clearance, disclosure of all medications, psychiatric history disclosure, time away from work, a named support person at home, no major life transition in progress, previous therapeutic work, no unaccompanied travel that day, abstinence from specific substances beforehand, signed agreement, nothing beyond willingness." },
      { n: 75, text: "What should be required of the practitioner? Click all, or write in. Current training, ongoing supervision, own continuing personal work, first aid or medical certification, insurance, written protocols, a second holder available, a colleague who can be called, a defined referral network, recovery time between containers." },
      { n: 76, text: "What should be required of the space? Click all, or write in. Private and interruption-free, bathroom access without leaving the container, temperature control, outdoor access, phone signal or landline, vehicle available, lockable, someone awake and sober on the premises, overnight accommodation, no other activity in the building." },
      { n: 77, text: "Which of those three lists would this field push back on hardest, and why?" },
      { n: 78, text: "What would you require that we did not list?" },
    ],
  },
  {
    id: "band-i",
    label: "Band I",
    title: "Vignettes",
    note: "Third-person scenarios. Rate one to ten and comment. This is where protocol depth is actually measured, and nothing in it is a statement about you.",
    items: [
      { n: 79, text: "A guide accepts a participant on a serotonergic antidepressant without a medical consult. Rate the seriousness. What should have happened?" },
      { n: 80, text: "A guide runs a single ninety-minute preparation call, then holds. What is missing?" },
      { n: 81, text: "A guide offers no contact after the day of." },
      { n: 82, text: "A participant becomes destabilized eleven days later. What is the obligation, and how long does it run?" },
      { n: 83, text: "A guide holds six people in a weekend, alone." },
      { n: 84, text: "A participant reaches for the guide's hand at the peak. Walk through the correct handling, including what consent should have been established beforehand." },
      { n: 85, text: "A participant develops romantic attachment afterward." },
      { n: 86, text: "A guide declines someone with a family history of a psychotic-spectrum condition. Right call or overcautious?" },
      { n: 87, text: "A guide has worked for eleven years and has never turned anyone away. What does that tell you?" },
      { n: 88, text: "A guide charges 4,500 US dollars and does no unpaid work." },
      { n: 89, text: "A guide's participant asks them to keep a secret from that participant's own therapist." },
      { n: 90, text: "Two guides in the same region disagree publicly about another guide's ethics. What should happen next?" },
    ],
  },
  {
    id: "band-j",
    label: "Band J",
    title: "Bio and Temperature",
    items: [
      { n: 91, text: "Paste your bio. Whatever you already use, unedited. No character limit." },
      { n: 92, text: "What does that bio not say about you?" },
      { n: 93, text: "How are you feeling about being asked all of this? Say it plainly, including if the answer is suspicious, tired, or annoyed." },
      { n: 94, text: "Mark each of the three publishable or private." },
    ],
  },
  {
    id: "band-k",
    label: "Band K",
    title: "The Reciprocity Gate",
    note: "Submission is disabled until items 95 through 99 are complete. No skip, no exception, no \"nothing to add.\"",
    items: [
      { n: 95, text: "Add. One question this instrument should ask and does not." },
      { n: 96, text: "Cut. One question here that is wrong, leading, naive, or unanswerable. Say why." },
      { n: 97, text: "Safety. One change that would make participating in this safer for practitioners." },
      { n: 98, text: "Usefulness. One change that would make this genuinely useful to a person choosing a guide, rather than useful to us." },
      { n: 99, text: "Access. One barrier that keeps practitioners out of instruments like this. Cost, language, geography, credential requirements, cultural framing, lineage politics. Name one and name the fix." },
      { n: 100, text: "Optional. Additional improvements, uncapped." },
      { n: 101, text: "Mark each publishable or private." },
    ],
  },
  {
    id: "band-l",
    label: "Band L",
    title: "Corroboration",
    note: "Optional. Skippable with no penalty and no visible consequence.",
    items: [
      { n: 102, text: "Set a shared passphrase. Two or three words that someone who genuinely knows you would also know. Stored only as a salted slow hash, never in readable form." },
      { n: 103, text: "How long have you known this practitioner?" },
      { n: 104, text: "Rate their preparation of you for what was ahead. 1 to 10." },
      { n: 105, text: "Rate their availability once the intensity had passed. 1 to 10." },
      { n: 106, text: "Rate their handling of the moment things were hardest. 1 to 10." },
      { n: 107, text: "Did they ever make you feel you owed them anything? Yes, no, unsure." },
      { n: 108, text: "In one or two sentences, what did they do that you would not have known to ask for?" },
    ],
  },
];
