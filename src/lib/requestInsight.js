import { normalizeInsight } from "../../shared/insightShape.js";

const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/g, "");
const insightsUrl = apiBaseUrl ? `${apiBaseUrl}/api/insights` : "/api/insights";

export async function requestInsight(task) {
  const response = await fetch(insightsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: task.title,
      details: task.details,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "Could not generate an AI suggestion.");
  }

  const insight = normalizeInsight(payload?.insight);

  if (!insight) {
    throw new Error("The AI suggestion could not be validated. Please try again.");
  }

  return insight;
}
