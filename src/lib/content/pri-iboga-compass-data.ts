/**
 * IBOGA COMPASS ASSESSMENT — v2 Data
 * 28 questions across 10 sections. 14 substance and behavior categories.
 * Full medical screening including family cardiac history, liver and kidney health,
 * mental health and contraindications. Drag-rank step for priority fine-tuning.
 */

export const COMPASS_INTRO = {
  tagline: "Find your right door to the medicine.",
  description:
    "28 questions across 10 sections. 14 substance and behavior categories. Full medical screening including family cardiac history, liver and kidney health, mental health and contraindications. Then drag your top dimensions up or down to fine-tune the match.",
  author: "Tony Greenberg",
  authorUrl: "https://tonygreenberg.com",
  name: "The Iboga Compass",
};

export const COMPASS_WHATS_NEW = [
  "14 substance categories — opioids, opioid replacement, alcohol, cocaine, methamphetamine, cannabis, nicotine, prescription stimulants, benzodiazepines, ketamine, MDMA, polydrug, process addictions, none",
  "Family cardiac history screen — Long QT Syndrome, sudden cardiac death under 50, general heart disease",
  "Liver, kidney, and diabetes screen — hepatitis, cirrhosis, kidney disease, elevated LFTs",
  "Mental health contraindication screen — personal/family psychosis, bipolar mania, PTSD",
  "Pregnancy and breastfeeding hard filter — absolute exclusion",
  "Antipsychotic and cardiac medication screen — added to the SSRI/MAOI/stimulant question",
  "Drag-rank step — reorder your top 10 dimensions to fine-tune match weighting (×2 at top, ×0.5 at bottom)",
  "Process addiction outcome path — gambling, porn, food, gaming routes to Tabula Rasa (explicit gambling program) and Ambio",
];

export const COMPASS_HOW_IT_WORKS =
  "Each user starts at uniform 0.10 weight across all 10 dimensions. Each answer applies (a) weight deltas to those 10 dimensions, (b) facility-specific bonus points, and (c) hard filters. After the 28 questions, the user enters the Priority Rank screen where dimensions are pre-ordered by their current weight; the user can move any dimension up or down using arrows. Position multipliers (×2.0 at top down to ×0.5 at bottom) apply to the existing weights. Weights re-normalize to sum to 1.";

export const COMPASS_FORMULA = "finalScore = Σ(weight × facility_score) × 10 + facility_bonus = capped at 100";

export const COMPASS_FORMULA_NOTE =
  "Eligible facilities (those passing all hard filters) sorted by score. Top 3 surface with match % and a 'Why this matched' narrative.";

export interface DimensionRow {
  num: string;
  dimension: string;
  measures: string;
}

export const COMPASS_DIMENSIONS: DimensionRow[] = [
  { num: "01", dimension: "Medical Safety", measures: "EKG, cardiac screening, on-site MD, hospital proximity" },
  { num: "02", dimension: "Clinical Track Record", measures: "Years operating, sessions completed, outcome data" },
  { num: "03", dimension: "Bwiti Authenticity", measures: "True Iboga lineage, Gabon training, ceremony depth" },
  { num: "04", dimension: "Integration Depth", measures: "Pre-prep, post-care, ongoing community support" },
  { num: "05", dimension: "Specialty Fit", measures: "Match between facility focus and your situation" },
  { num: "06", dimension: "Facility Quality", measures: "Accommodations, food, environment, privacy" },
  { num: "07", dimension: "Cost-to-Value", measures: "What you get per dollar of total program cost" },
  { num: "08", dimension: "Nagoya Reciprocity", measures: "Returns benefit to indigenous stewards" },
  { num: "09", dimension: "Access & Intake", measures: "Speed to admission, intake quality, eligibility" },
  { num: "10", dimension: "Reputation", measures: "Third-party credibility, peer reviews, media" },
];

export interface RankMultiplierRow {
  position: string;
  multiplier: string;
  effect: string;
}

export const COMPASS_RANK_MULTIPLIERS: RankMultiplierRow[] = [
  { position: "1st", multiplier: "×2.0", effect: "Most important — doubles weight" },
  { position: "2nd", multiplier: "×1.7", effect: "Strong emphasis" },
  { position: "3rd", multiplier: "×1.4", effect: "Above-baseline emphasis" },
  { position: "4th", multiplier: "×1.2", effect: "Slight emphasis" },
  { position: "5th", multiplier: "×1.0", effect: "Baseline" },
  { position: "6th", multiplier: "×0.9", effect: "Slight de-emphasis" },
  { position: "7th", multiplier: "×0.8", effect: "Below baseline" },
  { position: "8th", multiplier: "×0.7", effect: "De-emphasized" },
  { position: "9th", multiplier: "×0.6", effect: "Strongly de-emphasized" },
  { position: "10th", multiplier: "×0.5", effect: "Halved weight — least important" },
];

export interface QuestionSection {
  sectionNum: number;
  sectionTitle: string;
  questions: {
    id: string;
    text: string;
    note?: string;
    options: string[];
  }[];
}

export const COMPASS_QUESTIONS: QuestionSection[] = [
  {
    sectionNum: 1,
    sectionTitle: "Outcome",
    questions: [
      {
        id: "Q1",
        text: "What outcome are you primarily seeking?",
        options: [
          "Interrupt active substance dependency",
          "PTSD, trauma reset, deep psychological work",
          "Neurodegenerative — Parkinson's, MS, TBI",
          "Spiritual reckoning, identity reset, soul work",
          "Optimization, insight, peak performance",
          "Process addiction (gambling, porn, food, gaming)",
        ],
      },
      {
        id: "Q2",
        text: "How urgent is this for you?",
        options: ["Within 30 days", "1 to 3 months", "3 to 6 months", "Open timeline"],
      },
    ],
  },
  {
    sectionNum: 2,
    sectionTitle: "Substance & Behavior (Multi-Select)",
    questions: [
      {
        id: "Q3",
        text: "Substance or behavior of concern (select all that apply)",
        note: "Each selection compounds — choosing 3 substances applies all 3 sets of weights and boosts, accurately routing polydrug users to specialists like Experience Ibogaine (16-day poly program) and Ambio.",
        options: [
          "Opioids — heroin, fentanyl, oxycodone",
          "Opioid replacement — Suboxone, methadone, naltrexone",
          "Alcohol — heavy daily",
          "Cocaine or crack",
          "Methamphetamine",
          "Cannabis use disorder",
          "Nicotine dependency",
          "Prescription stimulants — Adderall, Ritalin, Vyvanse",
          "Benzodiazepines — Xanax, Klonopin, Valium",
          "Ketamine misuse",
          "MDMA chronic use",
          "Polydrug — multiple substances together",
          "Process addiction — gambling, porn, food, shopping",
          "No active substance issue",
        ],
      },
    ],
  },
  {
    sectionNum: 3,
    sectionTitle: "Medical Screening",
    questions: [
      {
        id: "Q4",
        text: "Personal cardiac history",
        options: [
          "Clean — no heart issues, no QT problems",
          "Hypertension, well managed → Med Safety ≥ 7",
          "Arrhythmia, prior cardiac event, or QT concerns → Med Safety ≥ 9",
          "I haven't had a recent cardiac workup → Med Safety ≥ 8",
        ],
      },
      {
        id: "Q5",
        text: "Family cardiac history",
        options: [
          "No known cardiac issues in immediate family",
          "Long QT Syndrome in immediate family → Med Safety ≥ 9",
          "Sudden cardiac death in family under age 50 → Med Safety ≥ 9",
          "Heart disease in family (general) → Med Safety ≥ 8",
          "Unknown — family history is unclear",
        ],
      },
      {
        id: "Q6",
        text: "Liver or kidney health",
        options: [
          "No known issues",
          "Diagnosed liver disease, hepatitis, or cirrhosis → Med Safety ≥ 9",
          "Diagnosed kidney disease → Med Safety ≥ 9",
          "Elevated liver enzymes from heavy drinking → Med Safety ≥ 8",
          "Diabetes (Type 1 or 2) → Med Safety ≥ 8",
          "Unknown — no recent bloodwork",
        ],
      },
      {
        id: "Q7",
        text: "Mental health history",
        options: [
          "No significant psychiatric history",
          "Depression or anxiety, well managed",
          "Personal history of psychosis or schizophrenia → Top-rated clinics only",
          "Bipolar disorder with active mania risk → Top-rated clinics only",
          "Family history of psychosis or bipolar → Med Safety ≥ 8",
          "PTSD or complex trauma diagnosis",
        ],
      },
      {
        id: "Q8",
        text: "Currently on psychiatric or QT-prolonging medications?",
        options: [
          "Yes — SSRIs or antidepressants → Med Safety ≥ 8",
          "Yes — stimulants → Med Safety ≥ 8",
          "Yes — benzodiazepines → Med Safety ≥ 8",
          "Yes — antipsychotics (Haldol, Risperdal, Abilify) → Med Safety ≥ 9",
          "Yes — heart medication (beta-blockers, antiarrhythmics) → Med Safety ≥ 9",
          "No psychiatric or cardiac medications",
        ],
      },
      {
        id: "Q9",
        text: "Pregnancy status",
        options: [
          "Not applicable",
          "Pregnant or trying to conceive → EXCLUDES ALL FACILITIES",
          "Currently breastfeeding → EXCLUDES ALL FACILITIES",
          "Not pregnant, not planning",
        ],
      },
    ],
  },
  {
    sectionNum: 4,
    sectionTitle: "Path & Values",
    questions: [
      {
        id: "Q10",
        text: "How do you want medicine and ceremony balanced?",
        options: [
          "Full medical — minimal or no ceremony",
          "Medical primary, light ceremonial framing",
          "Balanced hybrid — medical and ceremonial",
          "Ceremony primary, medical safety net",
          "Pure traditional Bwiti only",
        ],
      },
      {
        id: "Q11",
        text: "How important is true Bwiti lineage?",
        options: [
          "Critical — must be Bwiti-trained at the source",
          "Important — strongly prefer Bwiti-trained",
          "Neutral — open to either path",
          "I prefer modern clinical setting",
          "Want zero ceremony, medicine only",
        ],
      },
      {
        id: "Q12",
        text: "Does indigenous reciprocity matter to you?",
        options: [
          "Critical — capital must flow back to Gabon stewards",
          "Important — prefer facilities that give back",
          "Neutral but supportive in principle",
          "Not a factor in this decision",
        ],
      },
    ],
  },
  {
    sectionNum: 5,
    sectionTitle: "Budget & Time",
    questions: [
      {
        id: "Q13",
        text: "Total budget for the program",
        options: [
          "Under $5,000",
          "$5,000 to $10,000",
          "$10,000 to $20,000",
          "$20,000 to $50,000",
          "Open — value matters more than dollars",
        ],
      },
      {
        id: "Q14",
        text: "How long can you be away?",
        options: ["3 to 5 days", "7 to 10 days", "2 to 3 weeks", "1 month or more"],
      },
    ],
  },
  {
    sectionNum: 6,
    sectionTitle: "Geography",
    questions: [
      {
        id: "Q15",
        text: "Where would you go? (multi-select)",
        options: [
          "Mexico — Tijuana corridor",
          "Mexico — Cancún / Playa del Carmen",
          "Mexico — other (Sayulita, Los Cabos)",
          "Costa Rica",
          "Portugal or Spain",
          "Gabon",
          "USA mobile retreats",
        ],
      },
      {
        id: "Q16",
        text: "How far will you travel?",
        options: [
          "Anywhere on earth — including Gabon",
          "North America and Europe",
          "North America only → excludes Gabon, Europe",
          "Drive distance from US or domestic US only → excludes Gabon, Europe, Costa Rica",
        ],
      },
      {
        id: "Q17",
        text: "Language preference for staff",
        options: [
          "English only → excludes Gabon",
          "English primary, multilingual fine",
          "Want native Bwiti or French speakers",
        ],
      },
    ],
  },
  {
    sectionNum: 7,
    sectionTitle: "Experience & Identity",
    questions: [
      {
        id: "Q18",
        text: "Prior psychedelic experience",
        options: [
          "Complete first-timer",
          "Some — psilocybin or MDMA",
          "Multiple medicines including ayahuasca",
          "Extensive — long-term practitioner",
        ],
      },
      {
        id: "Q19",
        text: "Veteran or first responder?",
        options: [
          "Yes — military veteran or special operations → +15 boost to TMW",
          "Yes — police, fire, EMT",
          "No",
        ],
      },
      {
        id: "Q20",
        text: "Primary trauma source (if applicable)",
        options: [
          "Combat or military service",
          "Sexual assault or abuse",
          "Childhood or developmental",
          "Loss, grief, or sudden life event",
          "Not primarily trauma-driven",
        ],
      },
    ],
  },
  {
    sectionNum: 8,
    sectionTitle: "Comfort",
    questions: [
      {
        id: "Q21",
        text: "Privacy needs",
        options: [
          "Total privacy — celebrity-level",
          "High discretion needed",
          "Standard privacy is fine",
          "Group setting welcome",
        ],
      },
      {
        id: "Q22",
        text: "Group or individual?",
        options: [
          "Strictly private one-on-one only",
          "Very small group (2-4) acceptable",
          "Group cohort welcome",
        ],
      },
      {
        id: "Q23",
        text: "Facility amenity expectations",
        options: [
          "Luxury essential — five-star comfort",
          "Comfortable, hotel-grade",
          "Functional and clean is enough",
          "Rustic or traditional preferred",
        ],
      },
      {
        id: "Q24",
        text: "Dietary requirements",
        options: [
          "Strictly vegan or vegetarian — non-negotiable (HARD FILTER)",
          "Mostly plant-based, flexible",
          "Omnivore, standard fine",
        ],
      },
    ],
  },
  {
    sectionNum: 9,
    sectionTitle: "Integration & Family",
    questions: [
      {
        id: "Q25",
        text: "Family or spouse involvement",
        options: [
          "Spouse or partner attends with me → requires family-program facility",
          "Family briefed post-retreat",
          "Solo journey only",
        ],
      },
      {
        id: "Q26",
        text: "Aftercare and integration intensity",
        options: [
          "Lifetime community and ongoing support",
          "Structured program for 6+ months post",
          "Roughly 3 months of integration support",
          "Brief check-ins",
        ],
      },
    ],
  },
  {
    sectionNum: 10,
    sectionTitle: "Protocol & Motivation",
    questions: [
      {
        id: "Q27",
        text: "Risk tolerance",
        options: [
          "Lowest possible — maximum medical infrastructure → Med Safety ≥ 8",
          "Moderate with proper screening",
          "Higher risk acceptable for greater depth",
        ],
      },
      {
        id: "Q28",
        text: "Why now?",
        options: [
          "I've exhausted other treatments and need a reset",
          "Researching for a future decision",
          "Pre-decided — looking for the right fit",
          "Spiritual calling I cannot ignore",
          "A trusted person told me to do this",
        ],
      },
    ],
  },
];

export interface SubstanceRoutingRow {
  substance: string;
  facilities: string;
}

export const COMPASS_SUBSTANCE_ROUTING: SubstanceRoutingRow[] = [
  { substance: "Opioids (heroin, fentanyl)", facilities: "Ambio +5 · Dardashti +5 · TMW +4 · Tabula Rasa +4 · Clear Sky +4" },
  { substance: "Opioid replacement (Suboxone, methadone)", facilities: "Dardashti +10 · Ambio +5 · New Roots +4" },
  { substance: "Alcohol (heavy daily)", facilities: "Tabula Rasa +5 · Clear Sky +4 · Ambio +4 · Beond +3 · Crossroads +3" },
  { substance: "Cocaine", facilities: "Experience Ibogaine +8 · Dardashti +5 · Ambio +4 · Beond +3 · Clear Sky +3" },
  { substance: "Methamphetamine", facilities: "Experience Ibogaine +6 · Ambio +5 · Clear Sky +4 · Dardashti +4" },
  { substance: "Cannabis use disorder", facilities: "Iboga Wellness Center +4 · Root Healing +3 · Awakening +3" },
  { substance: "Nicotine", facilities: "Ambio +3 · Iboga Wellness +2 · Root Healing +2" },
  { substance: "Prescription stimulants (Adderall)", facilities: "Dardashti +5 · Ambio +4 · Beond +3" },
  { substance: "Benzodiazepines", facilities: "Ambio +5 · Tabula Rasa +4 · Dardashti +4" },
  { substance: "Ketamine misuse", facilities: "Ambio +4 · Beond +3" },
  { substance: "MDMA chronic use", facilities: "Ambio +4 · Beond +3" },
  { substance: "Polydrug", facilities: "Experience Ibogaine +8 · Ambio +5 · Clear Sky +4 · Dardashti +4" },
  { substance: "Process addiction (gambling, porn, food)", facilities: "Tabula Rasa +6 · Ambio +4 · Iboga Wellness +3 · Root Healing +3" },
  { substance: "None active", facilities: "Iboga Wellness +4 · Bwiti House +3 · Iboga Healing +3 · Root Healing +3" },
];

export interface HardFilterRow {
  filter: string;
  triggeredBy: string;
  effect: string;
}

export const COMPASS_HARD_FILTERS: HardFilterRow[] = [
  { filter: "EXCLUDE ALL", triggeredBy: "Pregnant or breastfeeding", effect: "Zero facilities returned — ibogaine contraindicated" },
  { filter: "Med Safety ≥ 9", triggeredBy: "Arrhythmia, family LQTS, family sudden death, liver/kidney disease, antipsychotics, cardiac meds", effect: "Filters to Ambio, TMW, Beond, Clear Sky, Tabula Rasa, Dardashti" },
  { filter: "Med Safety ≥ 8", triggeredBy: "SSRIs, stimulants, benzos, low risk tolerance, family heart disease, diabetes, elevated LFTs, cardiac workup unclear", effect: "Filters out lowest-medical Iboga centers" },
  { filter: "Top-Rated Only", triggeredBy: "Personal psychosis, schizophrenia, bipolar mania", effect: "Only highest-credentialed facilities remain" },
  { filter: "Budget cap", triggeredBy: "Strict budget under specific dollar amount", effect: "Drops facilities above cap" },
  { filter: "Time cap", triggeredBy: "3-5 day window", effect: "Drops Bwiti House (14d), Holistic Sanctuary (14d), Beond (10d), Avante (10d), Experience Ibogaine 16-day" },
  { filter: "No Gabon", triggeredBy: "Domestic-only or English-only", effect: "Drops Bwiti House" },
  { filter: "No Europe", triggeredBy: "NA-only", effect: "Drops Tabula Rasa, Root Healing, Bwitiboga" },
  { filter: "No Costa Rica", triggeredBy: "Drive-distance US", effect: "Drops Iboga Wellness, Awakening Soul" },
  { filter: "Vegan-only", triggeredBy: "Strict dietary", effect: "Drops Baja, Experience, New Roots, Rite of Passage, Sayulita (non-vegan policy), Pangea, Genesis, Casa Santa Isabel" },
  { filter: "Family required", triggeredBy: "Spouse attends", effect: "Requires family-program facility (TMW, Ambio, Beond, Clear Sky, Dardashti, Transcend, Avante, Holistic Sanctuary, Sayulita)" },
];

export interface ScenarioResult {
  title: string;
  results: string[];
}

export const COMPASS_SCENARIOS: ScenarioResult[] = [
  {
    title: "Scenario 1 — Polydrug User (cocaine + alcohol + benzodiazepines)",
    results: [
      "Ambio Life Sciences — 100% (broad addiction + benzo taper expertise)",
      "Tabula Rasa Retreat — 94% (alcohol + benzo + European option)",
      "Ibogaine by David Dardashti — 93% (long-term substance specialty)",
      "Experience Ibogaine — 93% (16-day poly-substance program)",
      "The Mission Within — 89%",
    ],
  },
  {
    title: "Scenario 2 — Spiritual Seeker, Bwiti+Nagoya priority-ranked top",
    results: [
      "Iboga Wellness Center — 100%",
      "Bwiti House Moughenda — 100%",
      "Clinical Mexico clinics drop ~35 points",
    ],
  },
  {
    title: "Scenario 3 — Process Addiction (Gambling)",
    results: [
      "Tabula Rasa Retreat — 92% (explicit gambling addiction program)",
      "Ambio Life Sciences — 92%",
      "Iboga Wellness Center — 86%",
    ],
  },
  {
    title: "Scenario 4 — Meth Use + Family LQTS (Med ≥ 9 hard filter)",
    results: [
      "Ambio Life Sciences — 89%",
      "The Mission Within — 82%",
      "Tabula Rasa Retreat — 79%",
    ],
  },
];

export const COMPASS_SOURCES = [
  { text: "Global Ibogaine Therapy Alliance (GITA) guidelines", url: "https://www.ibogainealliance.org/" },
  { text: "Americans for Ibogaine", url: "https://www.americansforibogaine.org/learn/safety/" },
  { text: "New Roots Ibogaine — medical tests required before treatment", url: "https://newrootsibogaine.com/articles/what-medical-tests-are-required-before-ibogaine-treatment/" },
  { text: "Iboga Wellness Institute — candidate screening protocol", url: "https://theibogainstitute.org/ibogaine-therapy-candidate-screening/" },
  { text: "Experience Ibogaine — cocaine program", url: "https://www.experienceibogaine.com/treatments/cocaine-addiction/" },
  { text: "Experience Ibogaine — meth program", url: "https://www.experienceibogaine.com/treatments/methamphetamine-addiction/" },
  { text: "Frontiers in Pharmacology — Mash et al. (2018) on opioid and cocaine detoxification outcomes", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5996271/" },
];

export const COMPASS_VALIDITY_NOTICE =
  "This assessment uses weighted multi-dimensional scoring with hard filters across cardiac safety, family cardiac history, liver function, mental health, budget, geography, and dietary constraints. The math is real but the outputs are guidance, not medical clearance. Ibogaine has a narrow therapeutic window and 38 documented fatalities are in the literature — almost all from prior cardiac issues or unscreened QT prolongation. Always require an EKG (QTc measured), comprehensive metabolic panel (potassium, magnesium, calcium), liver function panel, and a written intake before booking. If you are on SSRIs, MAOIs, stimulants, benzodiazepines, antipsychotics, or cardiac medications, those must be carefully tapered before treatment by a physician familiar with ibogaine pharmacology. Pregnancy and breastfeeding are absolute contraindications.";

export const COMPASS_REQUIRED_READING = [
  { text: "Iboga / Ibogaine — The Full Paradox", url: "/iboga-ibogaine", desc: "The complete architecture" },
  { text: "Psychedelics Could Become Extractive Capitalism", url: "https://tonygreenberg.com/blog/psychedelics-could-become-extractive-capitalism", desc: "The Nagoya question" },
  { text: "The Molecule as Mirror", url: "https://tonygreenberg.com/blog/the-molecule-as-mirror-from-substance-to-service", desc: "The reframe before the journey" },
];
