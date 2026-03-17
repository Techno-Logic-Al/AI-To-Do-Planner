export const INSIGHT_CATEGORIES = [
  "Planning",
  "Coding",
  "Debugging",
  "Learning",
  "Admin",
  "Errand",
  "Health",
  "Creative",
  "General",
];

export const INSIGHT_LIMITS = {
  refinedTitle: 90,
  improvementSummary: 220,
  nextStep: 260,
  batchWith: 160,
  tag: 24,
};

const TAG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 '&/:+-]{0,23}$/;
const GARBAGE_PATTERN =
  /WARNING_invalidJSON|TOO_FEW_TOKENS|INVALID_[A-Z_]{3,}/;
const UNEXPECTED_INSIGHT_GLYPH_PATTERN =
  /[^\p{Script=Latin}\p{Number}\s.,!?'"()&/:;+%-]/gu;
const DANGLING_ENDING_PATTERN =
  /(?:[-/:,;]|\b(?:a|an|the|this|that|these|those|my|your|our|their|his|her|its|and|or|to|for|with|without|into|onto|from|via|plus|in|on|at|by|of|off|up|down|over|under|through|around|about|near|before|after|during|while|how|why|when|where|because)\b)$/i;

export function normalizeInsight(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const insight = {
    refinedTitle: cleanSentence(raw.refinedTitle, INSIGHT_LIMITS.refinedTitle),
    category: cleanCategory(raw.category),
    improvementSummary: cleanSentence(
      raw.improvementSummary,
      INSIGHT_LIMITS.improvementSummary,
    ),
    nextStep: cleanSentence(raw.nextStep, INSIGHT_LIMITS.nextStep),
    batchWith: cleanSentence(raw.batchWith, INSIGHT_LIMITS.batchWith, {
      requireFullStop: true,
    }),
    tags: normalizeTags(raw.tags),
  };

  if (
    !insight.refinedTitle ||
    !insight.category ||
    !insight.improvementSummary ||
    !insight.nextStep ||
    !insight.batchWith ||
    insight.tags.length === 0
  ) {
    return null;
  }

  return insight;
}

export function normalizeTaskDetails(value) {
  if (typeof value !== "string") {
    return "";
  }

  const cleaned = sanitizeTaskText(value);
  return cleaned ? ensureFullStop(cleaned) : "";
}

function cleanCategory(value) {
  const cleaned = cleanSentence(value, 24);
  return INSIGHT_CATEGORIES.includes(cleaned) ? cleaned : "";
}

function normalizeTags(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueTags = [];

  for (const tag of value) {
    const cleanedTag = cleanTag(tag);

    if (!cleanedTag || uniqueTags.includes(cleanedTag)) {
      continue;
    }

    uniqueTags.push(cleanedTag);

    if (uniqueTags.length === 3) {
      break;
    }
  }

  return uniqueTags;
}

function cleanSentence(value, maxLength, options = {}) {
  if (typeof value !== "string") {
    return "";
  }

  const cleaned = options.requireFullStop
    ? ensureFullStop(sanitizeInsightText(value))
    : sanitizeInsightText(value);

  if (
    !cleaned ||
    cleaned.length > maxLength ||
    looksLikeModelGarbage(cleaned) ||
    hasDanglingEnding(cleaned) ||
    hasUnbalancedPairs(cleaned)
  ) {
    return "";
  }

  return cleaned;
}

function cleanTag(value) {
  if (typeof value !== "string") {
    return "";
  }

  const candidate = value.split(
    /WARNING_invalidJSON|TOO_FEW_TOKENS|INVALID_[A-Z_]{3,}|[\\[\]{}"`\u300C\u300D]/,
  )[0];

  const cleaned = sanitizeInsightText(candidate).slice(0, INSIGHT_LIMITS.tag);
  const safePrefix =
    cleaned.match(/^[A-Za-z0-9][A-Za-z0-9 '&/:+-]*/)?.[0]?.trim() || "";

  if (
    !safePrefix ||
    looksLikeModelGarbage(safePrefix) ||
    !TAG_PATTERN.test(safePrefix)
  ) {
    return "";
  }

  return safePrefix;
}

function sanitizeTaskText(value) {
  return normalizeCommonText(value);
}

function sanitizeInsightText(value) {
  return normalizeCommonText(value)
    .replace(UNEXPECTED_INSIGHT_GLYPH_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCommonText(value) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2010\u2011\u2013\u2014]/g, "-")
    .replace(/[\u300C\u300D]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureFullStop(value) {
  const cleaned = value.replace(/[!?;:,]+\s*$/g, "").trimEnd();

  if (!cleaned) {
    return "";
  }

  return cleaned.endsWith(".") ? cleaned : `${cleaned}.`;
}

function looksLikeModelGarbage(value) {
  return GARBAGE_PATTERN.test(value);
}

function hasDanglingEnding(value) {
  return DANGLING_ENDING_PATTERN.test(value);
}

function hasUnbalancedPairs(value) {
  return countChar(value, "(") > countChar(value, ")") ||
    countChar(value, "[") > countChar(value, "]") ||
    countChar(value, "{") > countChar(value, "}");
}

function countChar(value, char) {
  return [...value].filter((item) => item === char).length;
}
