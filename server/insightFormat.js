import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import {
  INSIGHT_CATEGORIES,
  INSIGHT_LIMITS,
  normalizeInsight,
} from "../shared/insightShape.js";

const tagPattern = /^[A-Za-z0-9][A-Za-z0-9 '&/:+-]{0,23}$/;

const insightSchema = z
  .object({
    refinedTitle: z.string().min(1).max(INSIGHT_LIMITS.refinedTitle),
    category: z.enum(INSIGHT_CATEGORIES),
    improvementSummary: z
      .string()
      .min(1)
      .max(INSIGHT_LIMITS.improvementSummary),
    nextStep: z.string().min(1).max(INSIGHT_LIMITS.nextStep),
    batchWith: z.string().min(1).max(INSIGHT_LIMITS.batchWith),
    tags: z
      .array(z.string().min(1).max(INSIGHT_LIMITS.tag).regex(tagPattern))
      .min(1)
      .max(3),
  })
  .strict();

export const insightTextFormat = zodTextFormat(
  insightSchema,
  "task_improvement",
  {
    description: "Actionable improvements for a single to-do item.",
  },
);

export function parseInsight(rawInsight) {
  return normalizeInsight(rawInsight);
}
