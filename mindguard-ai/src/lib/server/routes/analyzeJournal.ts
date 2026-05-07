import { geminiModel } from "../services/geminiService";
import type { SimilarEntry } from "../types/api";
import type { Insight } from "../types/ai";
import { generateEmbedding } from "../services/embeddingService";
import { saveJournalEmbedding, getRecentInsights, saveInsight } from "../services/firestoreService";
import { generateIntervention } from "../models/interventionService";
import { retrievePatterns } from "../models/triggerDetector";

interface AnalyzeJournalInput {
  uid: string;
  journalId: string;
  journalText: string;
  similarEntries?: SimilarEntry[];
}

interface GeminiInsightResponse {
  emotions: string[];
  stressors: string[];
  dominantMood: string;
  urgencyLevel: "low" | "medium" | "high";
  summary: string;
  topContributors: string[];
  immediateAction: string;
  weeklyAction: string;
  historicalPattern: string;
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

/**
 * Formats the retrieved similar past entries into a readable context block.
 * This is injected into the Gemini prompt so the model can reference history.
 */
const buildHistoryContext = (similarEntries: SimilarEntry[]): string => {
  if (!similarEntries || similarEntries.length === 0) {
    return "No similar past entries found. This may be one of the student's first entries.";
  }

  const formatted = similarEntries.map((entry, i) => {
    const when =
      entry.daysAgo === 0
        ? "today"
        : entry.daysAgo === 1
        ? "yesterday"
        : `${entry.daysAgo} days ago`;

    return `
Past entry ${i + 1} (written ${when}, similarity: ${Math.round(entry.similarity * 100)}%):
- Mood: ${entry.dominantMood}
- Emotions: ${entry.emotions.join(", ")}
- Stressors: ${entry.stressors.join(", ")}
- Risk level: ${entry.riskLevel}
- Summary: ${entry.aiSummary}
    `.trim();
  });

  return formatted.join("\n\n");
};

const buildPrompt = (
  journalText: string,
  similarEntries: SimilarEntry[]
): string => {
  const hasHistory = similarEntries.length > 0;
  const historyBlock = buildHistoryContext(similarEntries);

  return `
You are a compassionate student wellness assistant with memory of this student's past journal entries.
Analyze the following journal entry written by a college student.
Return ONLY a valid JSON object — no extra text, no markdown, no backticks.

${
  hasHistory
    ? `You have access to semantically similar past entries from this student.
Use them to identify whether these feelings are recurring and to personalize your response.
Reference specific time frames when relevant (e.g., "similar to how you felt 2 weeks ago").

PAST SIMILAR ENTRIES:
${historyBlock}`
    : "This appears to be one of the student's first journal entries, so respond without referencing past history."
}

The JSON must have exactly these fields:
{
  "emotions": [],
  "stressors": [],
  "dominantMood": "",
  "urgencyLevel": "",
  "summary": "",
  "topContributors": [],
  "immediateAction": "",
  "weeklyAction": "",
  "historicalPattern": ""
}

Field rules:
- emotions: 2 to 4 short emotion labels like ["anxious", "exhausted"]
- stressors: specific triggers mentioned or implied like ["assignment deadline", "poor sleep"]
- dominantMood: single word describing overall mood
- urgencyLevel: exactly one of "low", "medium", or "high"
- summary: 1 to 2 sentences, empathetic, written directly to the student using "you"${
    hasHistory
      ? `. If there's a clear recurring pattern, acknowledge it naturally (e.g., "This week feels similar to what you went through ${similarEntries[0]?.daysAgo} days ago...")`
      : ""
  }
- topContributors: 2 to 3 main factors behind their current state
- immediateAction: one concrete thing they can do tonight
- weeklyAction: one adjustment they can make this week for better balance
- historicalPattern: ${
    hasHistory
      ? `1 sentence describing what recurring pattern you notice across past + current entries, or "No clear pattern yet" if you don't see one`
      : `"First entry — no historical pattern available yet"`
  }

CURRENT journal entry:
"${journalText}"
`;
};

// ─── Parser ───────────────────────────────────────────────────────────────────

const parseGeminiResponse = (rawText: string): GeminiInsightResponse => {
  const cleaned = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  const required = [
    "emotions",
    "stressors",
    "dominantMood",
    "urgencyLevel",
    "summary",
    "topContributors",
    "immediateAction",
    "weeklyAction",
    "historicalPattern",
  ];

  for (const field of required) {
    if (!(field in parsed)) {
      throw new Error(`Missing field in Gemini response: ${field}`);
    }
  }

  const validLevels = ["low", "medium", "high"];
  if (!validLevels.includes(parsed.urgencyLevel)) {
    parsed.urgencyLevel = "medium";
  }

  return parsed as GeminiInsightResponse;
};

// ─── Main Export ──────────────────────────────────────────────────────────────

export const analyzeJournal = async (
  input: AnalyzeJournalInput
): Promise<Omit<Insight, "id" | "createdAt">> => {
  const { uid, journalId, journalText, similarEntries = [] } = input;

  if (!journalText || journalText.trim().length < 10) {
    throw new Error("Journal entry is too short to analyze.");
  }
  try {
    const vector = await generateEmbedding(journalText);
    await saveJournalEmbedding({ uid, journalId, vector, createdAt: new Date() });
  } catch (embeddingError) {
    console.warn("Embedding save failed (non-fatal):", embeddingError);
    // non-fatal — analysis still proceeds even if embedding fails
  }
  const prompt = buildPrompt(journalText, similarEntries);

  try {
    const result = await geminiModel.generateContent(prompt);
    const rawText = result.response.text();
    const parsed = parseGeminiResponse(rawText);

    // Build the base insight first
    const baseInsight = {
      uid,
      journalId,
      emotions: parsed.emotions,
      stressors: parsed.stressors,
      dominantMood: parsed.dominantMood,
      riskLevel: parsed.urgencyLevel,
      aiSummary: parsed.summary,
      topContributors: parsed.topContributors,
      immediateAction: parsed.immediateAction,
      weeklyAction: parsed.weeklyAction,
      historicalPattern: parsed.historicalPattern,
    };

    // Pull recent insights to compute patterns, then generate intervention
    let intervention = null;
    try {
      const recentInsights = await getRecentInsights(uid, 14);
      const patterns = retrievePatterns(recentInsights);
      intervention = await generateIntervention(baseInsight as any, patterns);
    } catch (interventionError) {
      console.warn("Intervention generation failed (non-fatal):", interventionError);
    }

    const finalInsight = {
      ...baseInsight,
      // Overwrite with richer intervention if available, fall back to Gemini's basic ones
      immediateAction: intervention?.immediateAction ?? baseInsight.immediateAction,
      weeklyAction: intervention?.studyAdjustment ?? baseInsight.weeklyAction,
      motivationalNote: intervention?.motivationalNote ?? null,
    };

    // Save the insight to Firestore so it shows up on the frontend dashboard
    await saveInsight(finalInsight as any);

    return finalInsight;
  } catch (error) {
    console.error("Gemini analyzeJournal error:", error);
    throw new Error("Failed to analyze journal. Please try again.");
  }
};