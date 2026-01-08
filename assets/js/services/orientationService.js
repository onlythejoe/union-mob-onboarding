const HYBRID_THRESHOLD = 1;
const PRIORITY = ["Media", "Fabric", "Scene", "Prod"];

function normalizeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function computePublicationScore(publication, score) {
  if (publication === "régulièrement") {
    score.Media += 3;
    return;
  }
  if (publication === "ponctuellement") {
    score.Media += 2;
    return;
  }
  score.Media += 1;
}

function computeProductionScore(sliderValue, score) {
  const numericValue = Number(sliderValue);
  const sanitized = Number.isNaN(numericValue) ? 0 : numericValue;
  if (sanitized >= 4) {
    score.Fabric += 3;
    score.Prod += 2;
    return;
  }
  if (sanitized >= 2) {
    score.Fabric += 2;
    score.Prod += 1;
    return;
  }
  score.Fabric += 1;
  score.Prod += 1;
}

function computeIncarnationScore(isIncarnated, score) {
  if (isIncarnated) {
    score.Scene += 3;
  }
}

function computeTechnicalScore(techList, score) {
  techList.forEach((tech) => {
    if (!tech) return;
    if (tech.includes("dev")) {
      score.Prod += 2;
    }
    if (tech.includes("fabrication")) {
      score.Fabric += 2;
    }
    if (tech.includes("audio")) {
      score.Prod += 1;
    }
    if (tech.includes("design")) {
      score.Fabric += 1;
    }
  });
}

function sortScores(score) {
  const entries = PRIORITY.map((mode) => [mode, score[mode] || 0]);
  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return PRIORITY.indexOf(a[0]) - PRIORITY.indexOf(b[0]);
  });
  return entries;
}

function buildOrientationResult(score) {
  const sorted = sortScores(score);
  const [primary, secondary] = sorted;
  const primaryValue = primary?.[1] ?? 0;
  const secondaryValue = secondary?.[1] ?? 0;
  const isHybrid =
    secondary && Math.abs(primaryValue - secondaryValue) <= HYBRID_THRESHOLD && primaryValue > 0;

  return {
    orientation_score: { ...score },
    orientation_suggeree: primaryValue > 0 ? primary[0] : null,
    orientation_secondaire: secondaryValue > 0 ? secondary[0] : null,
    orientation_hybride: Boolean(isHybrid)
  };
}

export function computeOrientation(formValues) {
  if (!formValues) return buildOrientationResult({ Media: 0, Fabric: 0, Scene: 0, Prod: 0 });
  const score = { Media: 0, Fabric: 0, Scene: 0, Prod: 0 };

  computePublicationScore(formValues.publication_preference, score);
  computeProductionScore(formValues.production_level, score);
  computeIncarnationScore(formValues.incarnation_public === "oui", score);
  computeTechnicalScore(normalizeArray(formValues.contribution_technique), score);

  return buildOrientationResult(score);
}

export function enrichWithOrientation(formValues) {
  const orientation = computeOrientation(formValues);
  return {
    ...formValues,
    ...orientation
  };
}
