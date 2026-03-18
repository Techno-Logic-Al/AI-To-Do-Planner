import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";
import OpenAI from "openai";
import { ZodError } from "zod";

import { insightTextFormat, parseInsight } from "./insightFormat.js";
import { INSIGHT_LIMITS } from "../shared/insightShape.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

const app = express();
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT) || 3001;
const model = process.env.OPENAI_MODEL || "gpt-5-mini";
const allowedOrigins = createAllowedOrigins(process.env.FRONTEND_ORIGIN);

const systemPrompt = [
  "You improve to-do items so they are easier to act on.",
  "Respond only with valid JSON that matches the provided schema.",
  "Keep every field concise, practical, and specific to the item.",
  "Use category grouping when it helps the user batch similar work together.",
  "Every free-text field must read as a complete thought, not a cut-off fragment.",
  "If a field would be too long, rewrite it shorter instead of ending mid-sentence.",
  "Use plain English with standard Latin characters and normal punctuation only.",
  "Do not use emojis, icons, or non-Latin glyphs.",
  "The batchWith field must end with a full stop.",
  "Use short, human-readable tags with only letters, numbers, spaces, apostrophes, ampersands, slashes, colons, plus signs, or hyphens.",
  "Do not invent context that is not implied by the task.",
].join(" ");

const retryPrompt = [
  "Your previous output did not meet formatting requirements.",
  `Keep improvementSummary under ${INSIGHT_LIMITS.improvementSummary} characters.`,
  `Keep nextStep under ${INSIGHT_LIMITS.nextStep} characters.`,
  `Keep batchWith under ${INSIGHT_LIMITS.batchWith} characters.`,
  "Use plain English with standard Latin characters only.",
  "The batchWith field must end with a full stop.",
  "Return complete, natural phrases only.",
  "Do not end with dangling words, unmatched brackets, or trailing hyphens.",
].join(" ");

const finalRetryPrompt = [
  "Your previous output was still too awkward or incomplete.",
  "Use shorter, plainer phrasing.",
  "Prefer one clean sentence per field.",
  "Use only standard Latin characters and punctuation.",
  "End batchWith with a full stop.",
  "Avoid semicolons, parentheses, and multi-part clauses unless they are necessary.",
  "Never leave a field ending on a connector, preposition, or unfinished comparison.",
].join(" ");

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use((req, res, next) => {
  const origin = req.get("Origin");

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/insights", async (req, res) => {
  const title = String(req.body?.title || "").trim();
  const details = String(req.body?.details || "").trim();

  if (!title) {
    return res.status(400).json({
      error: "A task title is required before requesting AI guidance.",
    });
  }

  if (title.length > 140 || details.length > 600) {
    return res.status(400).json({
      error: "Keep titles under 140 characters and notes under 600 characters.",
    });
  }

  if (!client) {
    return res.status(503).json({
      error:
        "OPENAI_API_KEY is missing. Add it to your environment before using AI insights.",
    });
  }

  const taskSummary = details
    ? `Title: ${title}\nDetails: ${details}`
    : `Title: ${title}`;

  try {
    const insight = await generateInsightWithRetries(taskSummary);

    if (!insight) {
      throw new Error("The model returned unusable structured output.");
    }

    return res.json({ insight });
  } catch (error) {
    console.error("Failed to generate insight:", error);

    const message =
      error?.status === 401
        ? "OpenAI authentication failed. Check OPENAI_API_KEY."
        : error instanceof SyntaxError || error instanceof ZodError
          ? "The AI response was malformed. Please try again."
          : "The AI insight request failed. Try again in a moment.";

    return res.status(500).json({ error: message });
  }
});

if (existsSync(distPath)) {
  app.use(express.static(distPath));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.method !== "GET") {
      return next();
    }

    return res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res
      .type("text/plain")
      .send(
        "Run `npm run dev` for development or `npm run build` before `npm start`.",
      );
  });
}

app.listen(port, host, () => {
  console.log(`AI To-Do server listening on http://${host}:${port}`);
});

function createAllowedOrigins(frontendOrigin) {
  return new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...String(frontendOrigin || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ]);
}

async function generateInsight(taskSummary, extraInstructions = "") {
  const instructions = extraInstructions
    ? `${systemPrompt} ${extraInstructions}`
    : systemPrompt;

  try {
    const response = await client.responses.parse({
      model,
      store: false,
      instructions,
      input: taskSummary,
      text: {
        format: insightTextFormat,
      },
    });

    return parseInsight(response.output_parsed);
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof ZodError) {
      return null;
    }

    throw error;
  }
}

async function generateInsightWithRetries(taskSummary) {
  const attemptPrompts = ["", retryPrompt, finalRetryPrompt];

  for (const prompt of attemptPrompts) {
    const insight = await generateInsight(taskSummary, prompt);

    if (insight) {
      return insight;
    }
  }

  return null;
}
