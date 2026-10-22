/**
 * IBOGA vs IBOGAINE — DEEP DIVE DATA MODULE
 * All structured data for the Iboga/Ibogaine comparison deep dive.
 * Mirrors the mescaline-module pattern.
 */

import {
  Brain,
  Earth,
  HandHeart,
  Heart,
  HeartHandshake,
  Hospital,
  Leaf,
  Pill,
  Sparkles,
  Sun,
  Syringe,
  TreeDeciduous,
  type LucideIcon,
} from "lucide-react";

/* ── Images ── */
export const IBOGA_IMAGES = {
  hero: "https://cdn.sanity.io/images/a3q1cyqs/production/72bfaa6dc05cf86d41081e93263d49ead17060d2-1920x1072.webp",
  alkaloidComparison: "https://cdn.sanity.io/images/a3q1cyqs/production/1a42bdb29d3160486134f44c848d4af669ac81f5-1920x1072.webp",
  pharmacology: "https://cdn.sanity.io/images/a3q1cyqs/production/f1e99527cb868def9e7c3444d0e7b733442de4f9-1920x1288.webp",
  bwitiTradition: "https://cdn.sanity.io/images/a3q1cyqs/production/db063b54c1e9f462969c24d033c5d3093a3048db-1200x670.jpg",
  clinicalSetting: "https://cdn.sanity.io/images/a3q1cyqs/production/9f670dc0c9754796c8227fc30461146695388f25-1920x1072.webp",
};

/* ── Pharmacology: Receptor Binding Profile ── */
export interface ReceptorRow {
  receptor: string;
  action: string;
  clinicalUse: string;
  ibogaineKi?: string;
}
export const IBOGAINE_PHARMACOLOGY: ReceptorRow[] = [
  { receptor: "NMDA (glutamate)", action: "Non-competitive antagonist", clinicalUse: "Addiction interruption, neuroplasticity, neuroprotection", ibogaineKi: "~3.1 μM" },
  { receptor: "κ-Opioid (KOR)", action: "Agonist", clinicalUse: "Anti-addictive effects, dysphoria modulation", ibogaineKi: "~2–4 μM" },
  { receptor: "μ-Opioid (MOR)", action: "Weak agonist (noribogaine stronger)", clinicalUse: "Opioid withdrawal attenuation", ibogaineKi: "~10 μM" },
  { receptor: "σ-2", action: "Agonist", clinicalUse: "Neuroprotection, anti-addictive signaling" },
  { receptor: "SERT (serotonin transporter)", action: "Inhibitor", clinicalUse: "Antidepressant, mood elevation", ibogaineKi: "~2 μM" },
  { receptor: "DAT (dopamine transporter)", action: "Inhibitor", clinicalUse: "Reward circuit reset, motivation", ibogaineKi: "~2 μM" },
  { receptor: "5-HT2A", action: "Partial agonist", clinicalUse: "Psychedelic/visionary experience", ibogaineKi: "~10 μM" },
  { receptor: "nACh (nicotinic)", action: "Antagonist", clinicalUse: "Smoking cessation potential" },
  { receptor: "GDNF / BDNF", action: "Upregulation (indirect)", clinicalUse: "Long-term neuroplasticity, dopamine neuron repair" },
];

/* ── Alkaloid Comparison Table ── */
export interface AlkaloidRow {
  alkaloid: string;
  abundance: string;
  primaryAction: string;
  uniqueProperty: string;
  presentIn: string;
}
export const ALKALOID_COMPARISON: AlkaloidRow[] = [
  { alkaloid: "Ibogaine", abundance: "~50–80% of total alkaloid content", primaryAction: "NMDA antagonist + KOR agonist + SERT/DAT inhibitor", uniqueProperty: "Primary anti-addictive compound; metabolized to noribogaine", presentIn: "Both" },
  { alkaloid: "Noribogaine (12-OH-ibogamine)", abundance: "~5% in bark; primary metabolite of ibogaine", primaryAction: "μ-Opioid agonist + SERT inhibitor (stronger than ibogaine)", uniqueProperty: "Half-life 24–48h vs 4–7h for ibogaine; sustained afterglow", presentIn: "Both (natural + metabolite)" },
  { alkaloid: "Ibogamine", abundance: "~5–15%", primaryAction: "Weak CNS stimulant, structural analog of ibogaine", uniqueProperty: "May modulate ibogaine's intensity; less studied independently", presentIn: "Whole plant only" },
  { alkaloid: "Tabernanthine", abundance: "~5–10%", primaryAction: "CNS stimulant, adrenergic activity", uniqueProperty: "Contributes to the stimulant phase of iboga experience", presentIn: "Whole plant only" },
  { alkaloid: "Voacangine", abundance: "~2–5%", primaryAction: "Anti-inflammatory, analgesic", uniqueProperty: "Precursor to ibogaine in biosynthesis; independent therapeutic potential", presentIn: "Whole plant only" },
  { alkaloid: "Coronaridine", abundance: "~1–3%", primaryAction: "α3β4 nicotinic antagonist", uniqueProperty: "Independent anti-addictive properties studied at NIDA", presentIn: "Whole plant only" },
  { alkaloid: "Ibogaline", abundance: "Trace", primaryAction: "Serotonergic modulation", uniqueProperty: "Contributes to entourage serotonin effects", presentIn: "Whole plant only" },
];

/* ── Head-to-Head Comparison ── */
export interface ComparisonRow {
  dimension: string;
  iboga: string;
  ibogaine: string;
}
export const HEAD_TO_HEAD: ComparisonRow[] = [
  { dimension: "Source", iboga: "Raw root bark of Tabernanthe iboga", ibogaine: "Purified alkaloid extracted from root bark (HCl salt)" },
  { dimension: "Alkaloid profile", iboga: "12+ alkaloids in full-spectrum synergy", ibogaine: "Single isolated compound" },
  { dimension: "Duration", iboga: "24–72 hours (variable)", ibogaine: "18–36 hours (more predictable)" },
  { dimension: "Dosing precision", iboga: "Variable — bark potency differs by harvest, age, region", ibogaine: "Exact mg/kg dosing possible" },
  { dimension: "Visionary intensity", iboga: "Extremely intense — full Bwiti initiation can last 3 days", ibogaine: "Intense but more contained; fewer hallucinations reported" },
  { dimension: "Traditional context", iboga: "Bwiti religion (Gabon/Cameroon) — initiation, healing, ancestor communion", ibogaine: "Clinical addiction treatment — Mexico, Brazil, New Zealand, South Africa" },
  { dimension: "Primary application", iboga: "Spiritual development, community healing, rites of passage", ibogaine: "Opioid/stimulant addiction interruption, PTSD, TBI, depression" },
  { dimension: "Cardiac risk", iboga: "Present — compounded by variable dosing and companion alkaloids", ibogaine: "Present — QT prolongation; mitigated by cardiac screening + monitoring" },
  { dimension: "Regulatory status", iboga: "Legal/unregulated in Gabon, Cameroon; Schedule I in US", ibogaine: "Unscheduled in Mexico, Brazil; prescription in NZ, AU; Schedule I in US" },
  { dimension: "Entourage effect", iboga: "Yes — companion alkaloids modulate, buffer, and extend the experience", ibogaine: "No — single compound; predictable but potentially less nuanced" },
  { dimension: "Metabolite profile", iboga: "Noribogaine + metabolites of all companion alkaloids", ibogaine: "Noribogaine (12-hydroxyibogamine) — sustained 24–48h half-life" },
  { dimension: "Cost", iboga: "$500–2,000 (ceremony, traditional setting)", ibogaine: "$5,000–12,000 (clinical treatment with medical monitoring)" },
];

/* ── Outcomes Data ── */
export interface OutcomeRow {
  condition: string;
  improved: string;
  source: string;
}
export const IBOGAINE_OUTCOMES: OutcomeRow[] = [
  { condition: "Opioid addiction (withdrawal elimination)", improved: "80–90%", source: "Mash et al., Ann NY Acad Sci 2000" },
  { condition: "Opioid craving reduction (sustained 12mo)", improved: "50–60%", source: "Noller et al., Am J Drug Alcohol Abuse 2018" },
  { condition: "Cocaine dependence", improved: "60–70%", source: "Schenberg et al., J Psychopharmacol 2014" },
  { condition: "Alcohol use disorder", improved: "50–65%", source: "Brown & Alper, Curr Drug Abuse Rev 2018" },
  { condition: "PTSD symptom reduction", improved: "65–80%", source: "Davis et al., Psychopharmacology 2017" },
  { condition: "Treatment-resistant depression", improved: "50–70%", source: "Noller et al., 2018; case series" },
  { condition: "Traumatic brain injury (TBI)", improved: "Significant improvement", source: "MAPS-sponsored case studies; Stanford 2024 trial" },
];

/* ── Pharma Alternatives (Ibogaine-specific) ── */
export interface PharmaAltRow {
  drug: string;
  category: string;
  ibogaAlt: string;
  supplementAlt: string;
  evidence: string;
}
export const IBOGA_PHARMA_ALTERNATIVES: PharmaAltRow[] = [
  { drug: "Methadone", category: "Opioid agonist (MAT)", ibogaAlt: "Ibogaine flood dose (single session)", supplementAlt: "NAC; Mag Glycinate; DLPA", evidence: "Strong (Mash, Noller)" },
  { drug: "Buprenorphine (Suboxone)", category: "Partial opioid agonist", ibogaAlt: "Ibogaine (requires taper first)", supplementAlt: "Black Seed Oil; Ashwagandha; GABA", evidence: "Strong" },
  { drug: "Naltrexone (Vivitrol)", category: "Opioid antagonist", ibogaAlt: "Ibogaine + noribogaine sustained effect", supplementAlt: "Kudzu; NAC; Milk Thistle", evidence: "Strong" },
  { drug: "Disulfiram (Antabuse)", category: "Alcohol deterrent", ibogaAlt: "Ibogaine (alcohol); Iboga ceremony", supplementAlt: "Kudzu; NAC; Dihydromyricetin (DHM)", evidence: "Moderate" },
  { drug: "Acamprosate (Campral)", category: "NMDA modulator (alcohol)", ibogaAlt: "Ibogaine (NMDA antagonist mechanism)", supplementAlt: "Taurine; Mag Threonate; L-Glutamine", evidence: "Moderate" },
  { drug: "Varenicline (Chantix)", category: "Smoking cessation", ibogaAlt: "Ibogaine (nicotinic antagonist)", supplementAlt: "Lobeline; Cytisine; NAC", evidence: "Emerging" },
  { drug: "Sertraline (Zoloft)", category: "SSRI (depression)", ibogaAlt: "Ibogaine (SERT inhibitor + neuroplasticity)", supplementAlt: "St. John's Wort; Saffron; Omega-3", evidence: "Moderate" },
  { drug: "Prazosin (PTSD nightmares)", category: "Alpha blocker", ibogaAlt: "Ibogaine (PTSD); Iboga ceremony", supplementAlt: "Phosphatidylserine; CBD; Lion's Mane", evidence: "Emerging" },
];

/* ── Supplement Stacks ── */
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
export const IBOGA_SUPPLEMENT_STACKS: SupplementPhase[] = [
  {
    phase: "PRE",
    timing: "4–8 weeks before (critical preparation window)",
    items: [
      { name: "Magnesium Glycinate", dosage: "400–600mg/day (cardiac support)", searchUrl: "https://amazon.com/s?k=magnesium+glycinate" },
      { name: "CoQ10 (Ubiquinol)", dosage: "200–400mg/day (cardiac protection)", searchUrl: "https://amazon.com/s?k=coq10+ubiquinol" },
      { name: "Omega-3 EPA+DHA", dosage: "3–4g/day (neuroprotection)", searchUrl: "https://amazon.com/s?k=nordic+naturals+omega+3" },
      { name: "Lion's Mane", dosage: "1000–2000mg/day (NGF support)", searchUrl: "https://amazon.com/s?k=lions+mane+extract" },
      { name: "NAC", dosage: "600mg 2x/day (stop 72hr before)", searchUrl: "https://amazon.com/s?k=n+acetyl+cysteine+NAC" },
      { name: "D3 + K2", dosage: "5000IU + 100mcg", searchUrl: "https://amazon.com/s?k=vitamin+d3+k2" },
      { name: "Potassium", dosage: "Electrolyte balance (critical for QT)", searchUrl: "https://amazon.com/s?k=potassium+supplement" },
    ],
  },
  {
    phase: "DAY-OF",
    timing: "Day of treatment (clinical protocol)",
    items: [
      { name: "Electrolytes (LMNT)", dosage: "2 packets pre-treatment", searchUrl: "https://amazon.com/s?k=LMNT+electrolytes" },
      { name: "Ginger root", dosage: "1000mg (nausea — iboga is intensely emetic)", searchUrl: "https://amazon.com/s?k=ginger+root+capsules" },
      { name: "Activated charcoal", dosage: "On standby (emergency purge support)", searchUrl: "https://amazon.com/s?k=activated+charcoal+capsules" },
    ],
  },
  {
    phase: "POST-INTEGRATION",
    timing: "4–12 weeks after (extended integration — noribogaine active 24–48h)",
    items: [
      { name: "Lion's Mane continued", dosage: "2000mg/day (BDNF/NGF support)", searchUrl: "https://amazon.com/s?k=lions+mane+extract" },
      { name: "Omega-3 continued", dosage: "3g/day", searchUrl: "https://amazon.com/s?k=nordic+naturals+omega+3" },
      { name: "Magnesium L-Threonate", dosage: "Standard dose (crosses BBB)", searchUrl: "https://amazon.com/s?k=magnesium+l-threonate" },
      { name: "Phosphatidylserine", dosage: "300mg/day (cortisol modulation)", searchUrl: "https://amazon.com/s?k=phosphatidylserine" },
      { name: "Microdose protocol (iboga)", dosage: "50–100mg root bark / every 3 days (Bwiti tradition)", searchUrl: "" },
    ],
  },
];

/* ── PRI Dimension Scores (iboga/ibogaine-specific) ── */
export interface DimScoreRow {
  icon: LucideIcon;
  dimension: string;
  ibogaThreshold: string;
  ibogaineThreshold: string;
  keyNote: string;
}
export const IBOGA_DIM_SCORES: DimScoreRow[] = [
  { icon: Brain, dimension: "Mental", ibogaThreshold: "Very High", ibogaineThreshold: "High", keyNote: "24–72hr duration demands exceptional psychological stability; no active psychosis, bipolar, or schizophrenia" },
  { icon: Heart, dimension: "Emotional", ibogaThreshold: "Very High", ibogaineThreshold: "High", keyNote: "Life-review visions surface buried trauma; full emotional surrender required" },
  { icon: Hospital, dimension: "Physical", ibogaThreshold: "Critical", ibogaineThreshold: "Critical", keyNote: "Mandatory cardiac screening (EKG + electrolytes); QT prolongation risk; liver function tests required" },
  { icon: Earth, dimension: "Set & Setting", ibogaThreshold: "Critical (Ceremonial)", ibogaineThreshold: "Critical (Clinical)", keyNote: "Iboga: Bwiti-trained facilitator non-negotiable. Ibogaine: medical supervision with cardiac monitoring" },
  { icon: HandHeart, dimension: "Spiritual", ibogaThreshold: "Highest Alignment", ibogaineThreshold: "High Alignment", keyNote: "Iboga is considered a sacrament in Bwiti — ancestor communion, death-rebirth initiation" },
];

/* ── Medicine Selector (Iboga context) ── */
export interface MedicineSelectorRow {
  icon: LucideIcon;
  medicine: string;
  addiction: string;
  depression: string;
  ptsd: string;
  tbi: string;
  duration: string;
  beginner: string;
  evidence: string;
}
export const IBOGA_MEDICINE_SELECTOR: MedicineSelectorRow[] = [
  { icon: TreeDeciduous, medicine: "Iboga (Whole Plant)", addiction: "✓", depression: "Some", ptsd: "✓", tbi: "Some", duration: "24–72h", beginner: "No", evidence: "Traditional" },
  { icon: Pill, medicine: "Ibogaine HCl", addiction: "Best", depression: "✓", ptsd: "✓", tbi: "✓", duration: "18–36h", beginner: "No", evidence: "Moderate–Strong" },
  { icon: Sparkles, medicine: "Psilocybin", addiction: "✓", depression: "✓", ptsd: "✓", tbi: "Some", duration: "4–6h", beginner: "Yes", evidence: "Strong" },
  { icon: HeartHandshake, medicine: "MDMA", addiction: "Some", depression: "Some", ptsd: "Best", tbi: "Some", duration: "4–6h", beginner: "Yes", evidence: "Strong" },
  { icon: Syringe, medicine: "Ketamine", addiction: "Some", depression: "Fastest", ptsd: "Some", tbi: "Some", duration: "1–2h", beginner: "Yes (clinical)", evidence: "Strong/FDA" },
  { icon: Leaf, medicine: "Ayahuasca", addiction: "✓", depression: "✓", ptsd: "✓", tbi: "—", duration: "4–8h", beginner: "No", evidence: "Moderate" },
  { icon: Sun, medicine: "Mescaline/Peyote", addiction: "✓", depression: "✓", ptsd: "✓", tbi: "—", duration: "8–12h", beginner: "Moderate", evidence: "Moderate" },
];

/* ── Sources ── */
export const IBOGA_SOURCES: string[] = [
  "Mash DC et al. (2000) Ibogaine: Complex pharmacokinetics, concerns for safety, and preliminary efficacy measures. Ann NY Acad Sci 914:394–401",
  "Noller GE et al. (2018) Ibogaine treatment outcomes for opioid dependence from a twelve-month follow-up observational study. Am J Drug Alcohol Abuse 44(1):37–46",
  "Glick SD, Maisonneuve IM, Pearl SM (1997) Evidence for roles of κ-opioid and NMDA receptors in the mechanism of action of ibogaine. Brain Res 749:340–343",
  "Sershen H, Hashim A, Lajtha A (1997) Ibogaine and cocaine abuse: pharmacological interactions at dopamine and serotonin receptors. Brain Res Bull 42(3):161–168",
  "Schenberg EE et al. (2014) Treating drug dependence with the aid of ibogaine: A retrospective study. J Psychopharmacol 28(11):993–1000",
  "Brown TK, Alper K (2018) Treatment of opioid use disorder with ibogaine: Detoxification and drug use outcomes. Am J Drug Alcohol Abuse 44(1):24–36",
  "Davis AK et al. (2017) Subjective effectiveness of ibogaine treatment for problematic opioid consumption. J Psychedelic Studies 1(2):65–73",
  "Alper KR et al. (1999) Treatment of acute opioid withdrawal with ibogaine. Am J Addict 8(3):234–242",
  "PMC7882011 — The Iboga Enigma: Chemistry and Neuropharmacology of Iboga Alkaloids",
  "PMC6301038 — Phytochemical characterization of Tabernanthe iboga root bark",
  "Bruneton J (2009) Pharmacognosy: Phytochemistry, Medicinal Plants — iboga alkaloid proportions",
  "Stanford/MAPS ibogaine for TBI — Phase 2 clinical trial data (2024)",
];

/* ── Page metadata ── */
export const IBOGA_META = {
  slug: "/iboga-ibogaine",
  tags: ["ceremony", "clinical", "addiction", "plant", "isolate"] as const,
  durationIboga: "24–72 hrs",
  durationIbogaine: "18–36 hrs",
};

/* ── Disclaimer ── */
export const IBOGA_DISCLAIMER = "NOT MEDICAL ADVICE. For educational purposes only. We are not doctors. Do not stop or modify any prescribed medication based on this content. Ibogaine carries significant cardiac risk including QT prolongation and fatal arrhythmia. Both iboga and ibogaine are Schedule I controlled substances in the United States. Mandatory cardiac screening (EKG, electrolyte panel, liver function) is non-negotiable before any ibogaine treatment. Dangerous interactions exist with opioids, SSRIs, MAOIs, stimulants, and many other medications. Always consult qualified healthcare professionals and seek medically supervised treatment. You proceed entirely at your own risk.";
