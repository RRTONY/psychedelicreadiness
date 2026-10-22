/**
 * IBOGA COMPASS — Scoring Engine
 * Computes dimension weights from answers, applies priority rank multipliers,
 * scores facilities, applies hard filters, and returns ranked results.
 */

import { FACILITIES, SUBSTANCE_BONUSES, type Facility } from "./pri-iboga-facility-data";

/** The 10 dimension keys in order */
export const DIMENSION_KEYS = [
  "medicalSafety",
  "clinicalTrackRecord",
  "bwitiAuthenticity",
  "integrationDepth",
  "specialtyFit",
  "facilityQuality",
  "costToValue",
  "nagoyaReciprocity",
  "accessIntake",
  "reputation",
] as const;

export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  medicalSafety: "Medical Safety",
  clinicalTrackRecord: "Clinical Track Record",
  bwitiAuthenticity: "Bwiti Authenticity",
  integrationDepth: "Integration Depth",
  specialtyFit: "Specialty Fit",
  facilityQuality: "Facility Quality",
  costToValue: "Cost-to-Value",
  nagoyaReciprocity: "Nagoya Reciprocity",
  accessIntake: "Access & Intake",
  reputation: "Reputation",
};

/** Priority rank multipliers by position (0-indexed) */
const RANK_MULTIPLIERS = [2.0, 1.7, 1.4, 1.2, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5];

/** Answer state for the assessment */
export interface CompassAnswers {
  [questionId: string]: number | number[]; // index of selected option, or array for multi-select
}

/** Hard filter types */
export interface HardFilters {
  excludeAll: boolean; // pregnancy
  minMedicalSafety: number; // 0 = no filter, 7/8/9 = minimum required
  topRatedOnly: boolean; // psychosis/bipolar
  maxBudget: number; // 0 = no cap
  maxDays: number; // 0 = no cap
  excludeGabon: boolean;
  excludeEurope: boolean;
  excludeCostaRica: boolean;
  veganOnly: boolean;
  familyRequired: boolean;
  veteranBoost: boolean;
}

/** Computed result for a single facility */
export interface FacilityResult {
  facility: Facility;
  score: number; // 0-100
  matchPercent: number;
  topDimensions: { key: DimensionKey; label: string; contribution: number }[];
  whyMatched: string;
  eliminated: boolean;
  eliminationReason?: string;
}

/**
 * Compute dimension weight deltas from answers
 */
export function computeWeightDeltas(answers: CompassAnswers): Record<DimensionKey, number> {
  const deltas: Record<DimensionKey, number> = {
    medicalSafety: 0,
    clinicalTrackRecord: 0,
    bwitiAuthenticity: 0,
    integrationDepth: 0,
    specialtyFit: 0,
    facilityQuality: 0,
    costToValue: 0,
    nagoyaReciprocity: 0,
    accessIntake: 0,
    reputation: 0,
  };

  // Q1: Outcome
  if (answers.Q1 !== undefined) {
    const idx = answers.Q1 as number;
    if (idx === 0) { // Substance dependency
      deltas.medicalSafety += 0.05;
      deltas.clinicalTrackRecord += 0.04;
      deltas.specialtyFit += 0.03;
    } else if (idx === 1) { // PTSD/trauma
      deltas.integrationDepth += 0.05;
      deltas.clinicalTrackRecord += 0.03;
      deltas.specialtyFit += 0.03;
    } else if (idx === 2) { // Neurodegenerative
      deltas.medicalSafety += 0.06;
      deltas.clinicalTrackRecord += 0.05;
    } else if (idx === 3) { // Spiritual
      deltas.bwitiAuthenticity += 0.06;
      deltas.nagoyaReciprocity += 0.04;
    } else if (idx === 4) { // Optimization
      deltas.facilityQuality += 0.03;
      deltas.integrationDepth += 0.03;
    } else if (idx === 5) { // Process addiction
      deltas.specialtyFit += 0.05;
      deltas.integrationDepth += 0.03;
    }
  }

  // Q2: Urgency
  if (answers.Q2 !== undefined) {
    const idx = answers.Q2 as number;
    if (idx === 0) { // Within 30 days
      deltas.accessIntake += 0.05;
    } else if (idx === 1) { // 1-3 months
      deltas.accessIntake += 0.02;
    }
  }

  // Q10: Medicine/ceremony balance
  if (answers.Q10 !== undefined) {
    const idx = answers.Q10 as number;
    if (idx === 0) { // Full medical
      deltas.medicalSafety += 0.04;
      deltas.bwitiAuthenticity -= 0.03;
    } else if (idx === 1) { // Medical primary
      deltas.medicalSafety += 0.03;
    } else if (idx === 2) { // Balanced
      deltas.bwitiAuthenticity += 0.02;
      deltas.medicalSafety += 0.02;
    } else if (idx === 3) { // Ceremony primary
      deltas.bwitiAuthenticity += 0.04;
    } else if (idx === 4) { // Pure Bwiti
      deltas.bwitiAuthenticity += 0.06;
      deltas.nagoyaReciprocity += 0.04;
      deltas.medicalSafety -= 0.02;
    }
  }

  // Q11: Bwiti lineage importance
  if (answers.Q11 !== undefined) {
    const idx = answers.Q11 as number;
    if (idx === 0) deltas.bwitiAuthenticity += 0.06;
    else if (idx === 1) deltas.bwitiAuthenticity += 0.04;
    else if (idx === 3) deltas.medicalSafety += 0.02;
    else if (idx === 4) deltas.medicalSafety += 0.03;
  }

  // Q12: Nagoya reciprocity
  if (answers.Q12 !== undefined) {
    const idx = answers.Q12 as number;
    if (idx === 0) deltas.nagoyaReciprocity += 0.06;
    else if (idx === 1) deltas.nagoyaReciprocity += 0.03;
  }

  // Q13: Budget
  if (answers.Q13 !== undefined) {
    const idx = answers.Q13 as number;
    if (idx === 0) deltas.costToValue += 0.06; // Under $5k
    else if (idx === 1) deltas.costToValue += 0.04; // $5-10k
    else if (idx === 4) deltas.facilityQuality += 0.03; // Open budget
  }

  // Q21: Privacy
  if (answers.Q21 !== undefined) {
    const idx = answers.Q21 as number;
    if (idx === 0 || idx === 1) deltas.facilityQuality += 0.04;
  }

  // Q23: Amenity expectations
  if (answers.Q23 !== undefined) {
    const idx = answers.Q23 as number;
    if (idx === 0) deltas.facilityQuality += 0.05; // Luxury
    else if (idx === 3) { // Rustic
      deltas.bwitiAuthenticity += 0.02;
      deltas.costToValue += 0.02;
    }
  }

  // Q26: Aftercare intensity
  if (answers.Q26 !== undefined) {
    const idx = answers.Q26 as number;
    if (idx === 0) deltas.integrationDepth += 0.06; // Lifetime
    else if (idx === 1) deltas.integrationDepth += 0.04; // 6+ months
    else if (idx === 2) deltas.integrationDepth += 0.02; // 3 months
  }

  // Q27: Risk tolerance
  if (answers.Q27 !== undefined) {
    const idx = answers.Q27 as number;
    if (idx === 0) deltas.medicalSafety += 0.05; // Lowest risk
    else if (idx === 2) { // Higher risk acceptable
      deltas.bwitiAuthenticity += 0.02;
      deltas.medicalSafety -= 0.02;
    }
  }

  return deltas;
}

/**
 * Compute hard filters from answers
 */
export function computeHardFilters(answers: CompassAnswers): HardFilters {
  const filters: HardFilters = {
    excludeAll: false,
    minMedicalSafety: 0,
    topRatedOnly: false,
    maxBudget: 0,
    maxDays: 0,
    excludeGabon: false,
    excludeEurope: false,
    excludeCostaRica: false,
    veganOnly: false,
    familyRequired: false,
    veteranBoost: false,
  };

  // Q4: Personal cardiac
  if (answers.Q4 !== undefined) {
    const idx = answers.Q4 as number;
    if (idx === 1) filters.minMedicalSafety = Math.max(filters.minMedicalSafety, 7);
    else if (idx === 2) filters.minMedicalSafety = Math.max(filters.minMedicalSafety, 9);
    else if (idx === 3) filters.minMedicalSafety = Math.max(filters.minMedicalSafety, 8);
  }

  // Q5: Family cardiac
  if (answers.Q5 !== undefined) {
    const idx = answers.Q5 as number;
    if (idx === 1 || idx === 2) filters.minMedicalSafety = Math.max(filters.minMedicalSafety, 9);
    else if (idx === 3) filters.minMedicalSafety = Math.max(filters.minMedicalSafety, 8);
  }

  // Q6: Liver/kidney
  if (answers.Q6 !== undefined) {
    const idx = answers.Q6 as number;
    if (idx === 1 || idx === 2) filters.minMedicalSafety = Math.max(filters.minMedicalSafety, 9);
    else if (idx === 3 || idx === 4) filters.minMedicalSafety = Math.max(filters.minMedicalSafety, 8);
  }

  // Q7: Mental health
  if (answers.Q7 !== undefined) {
    const idx = answers.Q7 as number;
    if (idx === 2 || idx === 3) filters.topRatedOnly = true;
    else if (idx === 4) filters.minMedicalSafety = Math.max(filters.minMedicalSafety, 8);
  }

  // Q8: Medications
  if (answers.Q8 !== undefined) {
    const idx = answers.Q8 as number;
    if (idx === 0 || idx === 1 || idx === 2) filters.minMedicalSafety = Math.max(filters.minMedicalSafety, 8);
    else if (idx === 3 || idx === 4) filters.minMedicalSafety = Math.max(filters.minMedicalSafety, 9);
  }

  // Q9: Pregnancy
  if (answers.Q9 !== undefined) {
    const idx = answers.Q9 as number;
    if (idx === 1 || idx === 2) filters.excludeAll = true;
  }

  // Q13: Budget
  if (answers.Q13 !== undefined) {
    const idx = answers.Q13 as number;
    if (idx === 0) filters.maxBudget = 5000;
    else if (idx === 1) filters.maxBudget = 10000;
    else if (idx === 2) filters.maxBudget = 20000;
    else if (idx === 3) filters.maxBudget = 50000;
  }

  // Q14: Duration
  if (answers.Q14 !== undefined) {
    const idx = answers.Q14 as number;
    if (idx === 0) filters.maxDays = 5;
    else if (idx === 1) filters.maxDays = 10;
    else if (idx === 2) filters.maxDays = 21;
    else if (idx === 3) filters.maxDays = 60;
  }

  // Q16: Travel distance
  if (answers.Q16 !== undefined) {
    const idx = answers.Q16 as number;
    if (idx === 2) { // NA only
      filters.excludeGabon = true;
      filters.excludeEurope = true;
    } else if (idx === 3) { // Drive distance
      filters.excludeGabon = true;
      filters.excludeEurope = true;
      filters.excludeCostaRica = true;
    }
  }

  // Q17: Language
  if (answers.Q17 !== undefined) {
    const idx = answers.Q17 as number;
    if (idx === 0) filters.excludeGabon = true; // English only
  }

  // Q19: Veteran
  if (answers.Q19 !== undefined) {
    const idx = answers.Q19 as number;
    if (idx === 0) filters.veteranBoost = true;
  }

  // Q24: Dietary
  if (answers.Q24 !== undefined) {
    const idx = answers.Q24 as number;
    if (idx === 0) filters.veganOnly = true;
  }

  // Q25: Family
  if (answers.Q25 !== undefined) {
    const idx = answers.Q25 as number;
    if (idx === 0) filters.familyRequired = true;
  }

  // Q27: Risk tolerance
  if (answers.Q27 !== undefined) {
    const idx = answers.Q27 as number;
    if (idx === 0) filters.minMedicalSafety = Math.max(filters.minMedicalSafety, 8);
  }

  return filters;
}

/**
 * Get substance bonuses from Q3 multi-select answers
 */
export function getSubstanceBonuses(answers: CompassAnswers): Record<string, number> {
  const bonuses: Record<string, number> = {};
  if (answers.Q3 === undefined) return bonuses;

  const selections = answers.Q3 as number[];
  const substanceKeys = [
    "opioids", "opioid-replacement", "alcohol", "cocaine", "meth",
    "cannabis", "nicotine", "prescription-stimulants", "benzos",
    "ketamine", "mdma", "polydrug", "process-addiction", "none",
  ];

  for (const idx of selections) {
    const key = substanceKeys[idx];
    if (!key) continue;
    const mapping = SUBSTANCE_BONUSES.find((sb) => sb.substanceKey === key);
    if (mapping) {
      for (const fb of mapping.facilityBonuses) {
        bonuses[fb.facilityId] = (bonuses[fb.facilityId] || 0) + fb.bonus;
      }
    }
  }

  return bonuses;
}

/**
 * Apply priority rank to weights
 */
export function applyPriorityRank(
  weights: Record<DimensionKey, number>,
  rankOrder: DimensionKey[]
): Record<DimensionKey, number> {
  const ranked: Record<DimensionKey, number> = { ...weights };

  for (let i = 0; i < rankOrder.length; i++) {
    const key = rankOrder[i];
    ranked[key] = weights[key] * RANK_MULTIPLIERS[i];
  }

  // Normalize to sum to 1
  const sum = Object.values(ranked).reduce((a, b) => a + b, 0);
  if (sum > 0) {
    for (const key of DIMENSION_KEYS) {
      ranked[key] = ranked[key] / sum;
    }
  }

  return ranked;
}

/**
 * Check if a facility passes all hard filters
 */
function checkFilters(facility: Facility, filters: HardFilters): { passes: boolean; reason?: string } {
  if (filters.excludeAll) {
    return { passes: false, reason: "Ibogaine is contraindicated during pregnancy or breastfeeding" };
  }

  if (filters.minMedicalSafety > 0 && facility.medicalSafety < filters.minMedicalSafety) {
    return { passes: false, reason: `Medical Safety score ${facility.medicalSafety} below required minimum of ${filters.minMedicalSafety}` };
  }

  if (filters.topRatedOnly && facility.clinicalTrackRecord < 8 && facility.medicalSafety < 9) {
    return { passes: false, reason: "Only top-rated clinics qualify for this medical profile" };
  }

  if (filters.maxBudget > 0 && facility.priceMin > filters.maxBudget) {
    return { passes: false, reason: `Minimum price $${facility.priceMin.toLocaleString("en-US")} exceeds budget cap of $${filters.maxBudget.toLocaleString("en-US")}` };
  }

  if (filters.maxDays > 0 && facility.durationDays[0] > filters.maxDays) {
    return { passes: false, reason: `Minimum stay of ${facility.durationDays[0]} days exceeds your ${filters.maxDays}-day window` };
  }

  if (filters.excludeGabon && facility.region === "gabon") {
    return { passes: false, reason: "Excluded by geography or language preference" };
  }

  if (filters.excludeEurope && (facility.region === "portugal" || facility.region === "spain")) {
    return { passes: false, reason: "Excluded by North America-only preference" };
  }

  if (filters.excludeCostaRica && facility.region === "costa-rica") {
    return { passes: false, reason: "Excluded by drive-distance-only preference" };
  }

  if (filters.veganOnly && !facility.veganFriendly) {
    return { passes: false, reason: "Does not accommodate strict vegan dietary requirements" };
  }

  if (filters.familyRequired && !facility.familyProgram) {
    return { passes: false, reason: "No family/spouse program available" };
  }

  return { passes: true };
}

/**
 * Generate "Why this matched" narrative
 */
function generateWhyMatched(
  facility: Facility,
  weights: Record<DimensionKey, number>,
  bonuses: Record<string, number>,
  filters: HardFilters
): string {
  const parts: string[] = [];

  // Find top 2 contributing dimensions
  const contributions = DIMENSION_KEYS.map((key) => ({
    key,
    label: DIMENSION_LABELS[key],
    score: facility[key] as number,
    weight: weights[key],
    contribution: (facility[key] as number) * weights[key],
  })).sort((a, b) => b.contribution - a.contribution);

  const top = contributions[0];
  const second = contributions[1];

  parts.push(`Strongest match on ${top.label} (${top.score}/10)`);
  if (second.contribution > 0.5) {
    parts.push(`with strong ${second.label} (${second.score}/10)`);
  }

  // Substance bonus
  const bonus = bonuses[facility.id] || 0;
  if (bonus >= 8) parts.push("— top-tier substance specialty match");
  else if (bonus >= 5) parts.push("— strong substance routing");
  else if (bonus >= 3) parts.push("— relevant substance experience");

  // Veteran boost
  if (filters.veteranBoost && facility.veteranFocus) {
    parts.push("+ veteran-focused program");
  }

  // Special highlights
  if (facility.bwitiAuthenticity >= 8 && weights.bwitiAuthenticity > 0.12) {
    parts.push("— authentic Bwiti lineage");
  }
  if (facility.nagoyaReciprocity >= 8 && weights.nagoyaReciprocity > 0.1) {
    parts.push("— strong indigenous reciprocity");
  }

  return parts.join(" ");
}

/**
 * Main scoring function — takes answers + rank order, returns sorted results
 */
export function scoreAllFacilities(
  answers: CompassAnswers,
  rankOrder: DimensionKey[]
): FacilityResult[] {
  // 1. Compute base weights (uniform 0.10 + deltas)
  const deltas = computeWeightDeltas(answers);
  const baseWeights: Record<DimensionKey, number> = {} as Record<DimensionKey, number>;
  for (const key of DIMENSION_KEYS) {
    baseWeights[key] = 0.1 + deltas[key];
    if (baseWeights[key] < 0.01) baseWeights[key] = 0.01; // floor
  }

  // 2. Apply priority rank multipliers
  const finalWeights = applyPriorityRank(baseWeights, rankOrder);

  // 3. Compute hard filters
  const filters = computeHardFilters(answers);

  // 4. Get substance bonuses
  const bonuses = getSubstanceBonuses(answers);

  // 5. Score each facility
  const results: FacilityResult[] = FACILITIES.map((facility) => {
    // Check filters
    const filterResult = checkFilters(facility, filters);

    // Compute weighted score
    let rawScore = 0;
    for (const key of DIMENSION_KEYS) {
      rawScore += finalWeights[key] * (facility[key] as number);
    }

    // Apply formula: finalScore = Σ(weight × facility_score) × 10 + facility_bonus, capped at 100
    const facilityBonus = bonuses[facility.id] || 0;
    let finalScore = rawScore * 10 + facilityBonus;

    // Veteran boost
    if (filters.veteranBoost && facility.veteranFocus) {
      finalScore += 15;
    }

    finalScore = Math.min(100, Math.max(0, finalScore));

    // Top contributing dimensions
    const contributions = DIMENSION_KEYS.map((key) => ({
      key,
      label: DIMENSION_LABELS[key],
      contribution: finalWeights[key] * (facility[key] as number) * 10,
    })).sort((a, b) => b.contribution - a.contribution);

    return {
      facility,
      score: Math.round(finalScore * 10) / 10,
      matchPercent: Math.round(finalScore),
      topDimensions: contributions.slice(0, 3),
      whyMatched: generateWhyMatched(facility, finalWeights, bonuses, filters),
      eliminated: !filterResult.passes,
      eliminationReason: filterResult.reason,
    };
  });

  // 6. Sort: eligible first (by score desc), then eliminated
  results.sort((a, b) => {
    if (a.eliminated && !b.eliminated) return 1;
    if (!a.eliminated && b.eliminated) return -1;
    return b.score - a.score;
  });

  return results;
}

/**
 * Get initial rank order based on current weight deltas
 */
export function getInitialRankOrder(answers: CompassAnswers): DimensionKey[] {
  const deltas = computeWeightDeltas(answers);
  const weighted = DIMENSION_KEYS.map((key) => ({
    key,
    weight: 0.1 + deltas[key],
  }));
  weighted.sort((a, b) => b.weight - a.weight);
  return weighted.map((w) => w.key);
}
