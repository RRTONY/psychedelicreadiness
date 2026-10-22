/**
 * MESCALINE / PEYOTE — PRI DEEP-DIVE MODULE
 * Comprehensive pharmacology, outcomes, pharma alternatives, supplement stacks,
 * dimension scores, medicine selector, and sources.
 *
 * Source: Agin-Liebes et al. (2021) ACS Pharmacology, n=452 naturalistic users
 * NOT MEDICAL ADVICE. EDUCATIONAL ONLY.
 */

/* ── Pharmacology ── */

import { Brain, Earth, HandHeart, Heart, HeartHandshake, Hospital, Leaf, Microscope, Mountain, Pill, Sparkles, Sun, TreeDeciduous, type LucideIcon } from "lucide-react";

export interface ReceptorRow {
  receptor: string;
  action: string;
  clinicalUse: string;
}

export const MESCALINE_PHARMACOLOGY: ReceptorRow[] = [
  { receptor: "5-HT2A", action: "Partial agonist", clinicalUse: "Primary psychedelic; depression, neuroplasticity" },
  { receptor: "5-HT2C", action: "Biased agonist", clinicalUse: "Mood, appetite neutral" },
  { receptor: "D1/D2/D3", action: "Low-affinity binding", clinicalUse: "Prosocial, motivation" },
  { receptor: "\u03B11A/\u03B12A", action: "Agonist", clinicalUse: "Arousal, sympathomimetic" },
  { receptor: "SERT/NET/DAT", action: "No affinity", clinicalUse: "No serotonin dump (unlike MDMA/SSRIs)" },
];

/* ── Latuda Mirror ── */

export interface LatudaMirrorRow {
  receptor: string;
  latuda: string;
  mescaline: string;
}

export const LATUDA_MIRROR: LatudaMirrorRow[] = [
  { receptor: "5-HT2A", latuda: "Blocks (Ki=0.47nM)", mescaline: "Activates" },
  { receptor: "5-HT7", latuda: "Blocks (antidepressant)", mescaline: "Indirect modulation" },
  { receptor: "5-HT1A", latuda: "Partial agonist", mescaline: "Upstream upregulation" },
  { receptor: "D2", latuda: "Full antagonist", mescaline: "Low-affinity touch" },
  { receptor: "BDNF", latuda: "Increases over weeks", mescaline: "Acute surge (one session)" },
];

export const LATUDA_MIRROR_ONELINER = "Latuda suppresses the serotonin system daily. Mescaline resets it once.";

/* ── Outcomes Data ── */

export interface OutcomeRow {
  condition: string;
  improved: string;
}

export const MESCALINE_OUTCOMES: OutcomeRow[] = [
  { condition: "Depression", improved: "86%" },
  { condition: "Anxiety", improved: "80%" },
  { condition: "PTSD", improved: "76%" },
  { condition: "Alcohol use disorder", improved: "76%" },
  { condition: "Drug use disorder", improved: "68%" },
];

export const OUTCOMES_SOURCE = "Agin-Liebes et al., ACS Pharmacology 2021 (n=452 naturalistic users)";
export const OUTCOMES_SPIRITUAL = "35\u201350% rated it single most spiritually significant experience of their life";
export const OUTCOMES_INTENT = "Only 2\u20135% took it intending to treat a condition";

/* ── Pharma \u2192 Plant Alternatives ── */

export interface PharmaAltRow {
  drug: string;
  category: string;
  plantAlt: string;
  supplementAlt: string;
  evidence: string;
}

export const PHARMA_ALTERNATIVES: PharmaAltRow[] = [
  { drug: "Sertraline (Zoloft)", category: "SSRI", plantAlt: "Psilocybin; Mescaline", supplementAlt: "St. John\u2019s Wort; Saffron; Omega-3 EPA", evidence: "Strong (Psilo)" },
  { drug: "Escitalopram (Lexapro)", category: "SSRI", plantAlt: "Psilocybin (head-to-head trial)", supplementAlt: "Rhodiola; Ashwagandha KSM-66; SAMe", evidence: "Strong" },
  { drug: "Venlafaxine (Effexor)", category: "SNRI", plantAlt: "MDMA therapy; Ketamine", supplementAlt: "5-HTP; Mag Threonate; NAC", evidence: "Moderate" },
  { drug: "Bupropion (Wellbutrin)", category: "NDRI", plantAlt: "Ibogaine; Psilocybin (smoking)", supplementAlt: "Tyrosine; Mucuna pruriens", evidence: "Strong (Psilo+smoking)" },
  { drug: "Lurasidone (Latuda)", category: "Antipsychotic", plantAlt: "Mescaline/Peyote; Psilocybin", supplementAlt: "Lion\u2019s Mane; Omega-3; Glycine 8g", evidence: "Emerging (Mesc)" },
  { drug: "Quetiapine (Seroquel)", category: "Antipsychotic", plantAlt: "Holotropic Breathwork; Microdose", supplementAlt: "Magnesium Glycinate; L-Theanine", evidence: "Emerging" },
  { drug: "Aripiprazole (Abilify)", category: "Antipsychotic", plantAlt: "Microdose Psilocybin; CBD", supplementAlt: "Bacopa; NAC; Sarcosine", evidence: "Emerging" },
  { drug: "Alprazolam (Xanax)", category: "Benzo", plantAlt: "Rap\u00e9h; Breathwork; Cacao", supplementAlt: "Kava (200\u2013300mg); GABA+L-Theanine", evidence: "Moderate (Kava)" },
  { drug: "Buspirone (Buspar)", category: "5-HT1A", plantAlt: "Mescaline; Psilocybin", supplementAlt: "Ashwagandha; CBD; Rhodiola", evidence: "Moderate" },
  { drug: "Lithium (Lithobid)", category: "Mood stabilizer", plantAlt: "\u26A0\uFE0F Contraindicated with most psychedelics", supplementAlt: "Lithium Orotate 5\u201320mg; Omega-3; Inositol", evidence: "Moderate" },
  { drug: "Valproate (Depakote)", category: "Mood stabilizer", plantAlt: "Psilocybin (cluster HA); LSD micro", supplementAlt: "Magnesium; Riboflavin 400mg", evidence: "Emerging" },
  { drug: "Prazosin (PTSD)", category: "Alpha blocker", plantAlt: "MDMA therapy; Mescaline", supplementAlt: "Phosphatidylserine; Lion\u2019s Mane; CBD", evidence: "Strong (MDMA)" },
  { drug: "Methylphenidate (Ritalin)", category: "Stimulant/ADHD", plantAlt: "Microdosing; Lion\u2019s Mane Stack", supplementAlt: "Bacopa; Omega-3; Zinc; PS", evidence: "Emerging" },
  { drug: "Naltrexone (Vivitrol)", category: "Opioid antagonist", plantAlt: "Ibogaine; Peyote (alcohol); Psilocybin", supplementAlt: "NAC; Kudzu; Milk Thistle", evidence: "Strong (Ibogaine+Peyote)" },
  { drug: "Varenicline (Chantix)", category: "Smoking cessation", plantAlt: "Psilocybin (80% quit, Hopkins)", supplementAlt: "Lobeline; Cytisine; NAC", evidence: "Strong" },
  { drug: "Zolpidem (Ambien)", category: "Sleep", plantAlt: "CBD; Breathwork", supplementAlt: "Mag Glycinate; Glycine 3g; L-Theanine", evidence: "Moderate" },
];

/* ── Supplement Stack ── */

export interface SupplementItem {
  name: string;
  dosage: string;
  searchUrl: string;
}

export interface SupplementPhase {
  phase: string;
  timing: string;
  items: SupplementItem[];
}

export const SUPPLEMENT_STACKS: SupplementPhase[] = [
  {
    phase: "PRE",
    timing: "4\u20136 weeks before",
    items: [
      { name: "Lion\u2019s Mane", dosage: "500\u20131500mg/day", searchUrl: "https://amazon.com/s?k=lions+mane+extract" },
      { name: "Omega-3 EPA+DHA", dosage: "2\u20134g/day", searchUrl: "https://amazon.com/s?k=nordic+naturals+omega+3" },
      { name: "Magnesium L-Threonate (Magtein)", dosage: "Standard dose", searchUrl: "https://amazon.com/s?k=magnesium+l-threonate" },
      { name: "Ashwagandha KSM-66", dosage: "300\u2013600mg 2x/day", searchUrl: "https://amazon.com/s?k=ashwagandha+ksm-66" },
      { name: "NAC", dosage: "600mg 2x (stop 48hr before)", searchUrl: "https://amazon.com/s?k=n+acetyl+cysteine+NAC" },
      { name: "D3 + K2", dosage: "5000IU + 100mcg", searchUrl: "https://amazon.com/s?k=vitamin+d3+k2" },
    ],
  },
  {
    phase: "DAY-OF",
    timing: "Day of ceremony",
    items: [
      { name: "Ginger root", dosage: "500mg 1hr before (nausea)", searchUrl: "https://amazon.com/s?k=ginger+root+capsules" },
      { name: "Niacin (flush)", dosage: "100\u2013500mg emergency grounding", searchUrl: "https://amazon.com/s?k=niacin+flush" },
      { name: "Electrolytes (LMNT)", dosage: "1 packet pre + during", searchUrl: "https://amazon.com/s?k=LMNT+electrolytes" },
    ],
  },
  {
    phase: "POST-INTEGRATION",
    timing: "4\u20138 weeks after",
    items: [
      { name: "Lion\u2019s Mane continued", dosage: "1000\u20132000mg/day", searchUrl: "https://amazon.com/s?k=lions+mane+extract" },
      { name: "Phosphatidylserine", dosage: "300\u2013400mg/day", searchUrl: "https://amazon.com/s?k=phosphatidylserine" },
      { name: "5-HTP", dosage: "100mg evening (MDMA only; never with SSRIs)", searchUrl: "https://amazon.com/s?k=5-htp+100mg" },
      { name: "Microdose protocol (Fadiman)", dosage: "0.1g psilocybin / every 3 days", searchUrl: "" },
    ],
  },
];

/* ── PRI Dimension Scores (mescaline-specific) ── */

export interface DimScoreRow {
  icon: LucideIcon;
  dimension: string;
  threshold: string;
  keyNote: string;
}

export const MESCALINE_DIM_SCORES: DimScoreRow[] = [
  { icon: Brain, dimension: "Mental", threshold: "High", keyNote: "8\u201312hr duration demands stability; no active psychosis" },
  { icon: Heart, dimension: "Emotional", threshold: "Moderate-High", keyNote: "Gentle vs ibogaine; difficult emotions surface" },
  { icon: Hospital, dimension: "Physical", threshold: "Moderate", keyNote: "Cardio clearance needed; MAOI/Lithium contraindicated; nausea hrs 1\u20133" },
  { icon: Earth, dimension: "Set & Setting", threshold: "Critical", keyNote: "Ceremonial structure non-negotiable; outdoor > indoor" },
  { icon: HandHeart, dimension: "Spiritual", threshold: "High Alignment", keyNote: "35\u201350% single most significant spiritual event of life" },
];

/* ── Medicine Selector Comparison ── */

export interface MedicineSelectorRow {
  icon: LucideIcon;
  medicine: string;
  depression: string;
  anxiety: string;
  ptsd: string;
  addiction: string;
  duration: string;
  beginner: string;
  evidence: string;
}

export const MEDICINE_SELECTOR: MedicineSelectorRow[] = [
  { icon: Sun, medicine: "Mescaline/Peyote", depression: "\u2713", anxiety: "\u2713", ptsd: "\u2713", addiction: "\u2713", duration: "8\u201312h", beginner: "Moderate", evidence: "Moderate" },
  { icon: Sparkles, medicine: "Psilocybin", depression: "\u2713", anxiety: "\u2713", ptsd: "\u2713", addiction: "\u2713", duration: "4\u20136h", beginner: "Yes", evidence: "Strong" },
  { icon: HeartHandshake, medicine: "MDMA", depression: "Some", anxiety: "Some", ptsd: "Best", addiction: "Some", duration: "4\u20136h", beginner: "Yes", evidence: "Strong" },
  { icon: Pill, medicine: "Ketamine", depression: "Fastest", anxiety: "Some", ptsd: "Some", addiction: "Some", duration: "1\u20132h", beginner: "Yes (clinical)", evidence: "Strong/FDA" },
  { icon: Leaf, medicine: "Ayahuasca", depression: "\u2713", anxiety: "\u2713", ptsd: "\u2713", addiction: "\u2713", duration: "4\u20138h", beginner: "No", evidence: "Moderate" },
  { icon: TreeDeciduous, medicine: "Ibogaine", depression: "Some", anxiety: "Some", ptsd: "\u2713", addiction: "Best", duration: "24\u201336h", beginner: "No", evidence: "Moderate" },
  { icon: Mountain, medicine: "San Pedro", depression: "\u2713", anxiety: "\u2713", ptsd: "\u2713", addiction: "\u2713", duration: "8\u201314h", beginner: "Moderate", evidence: "Moderate" },
  { icon: Microscope, medicine: "Microdose", depression: "\u2713", anxiety: "\u2713", ptsd: "Some", addiction: "\u2713", duration: "Sub-perceptual", beginner: "Very Yes", evidence: "Moderate" },
];

/* ── Sources ── */

export const MESCALINE_SOURCES: string[] = [
  "Agin-Liebes et al. (2021) ACS Pharmacology \u2014 mescaline survey n=452",
  "Ishibashi et al. (2010) J Pharmacol \u2014 lurasidone receptor profile",
  "Wikipedia / DrugBank \u2014 lurasidone Ki values",
  "PMC6864602 \u2014 peyote pharmacokinetics review",
  "MDPI Molecules 28(24) 7942 (2023) \u2014 peyote overview",
  "Johns Hopkins Psychedelics Center \u2014 psilocybin + smoking",
  "QPS.com / Third Wave \u2014 mescaline clinical development",
];

/* ── Page metadata ── */

export const MESCALINE_META = {
  slug: "/peyote-mescaline",
  tags: ["ceremony", "intense", "plant"] as const,
  duration: "8\u201312 hrs",
  potencyNote: "~5% relative to psilocybin (requires 200\u2013400mg vs 10\u201330mg)",
};

/* ── Disclaimer (must include verbatim) ── */

export const MESCALINE_DISCLAIMER = "NOT MEDICAL ADVICE. For educational purposes only. We are not doctors. Do not stop or modify any prescribed medication based on this content. Many substances discussed are Schedule I controlled substances. Dangerous interactions exist between plant medicines and psychiatric drugs \u2014 including serotonin syndrome risk (SSRIs + MAOIs) and seizure risk (Lithium + psychedelics). Always consult qualified healthcare professionals before any action. You proceed entirely at your own risk.";
