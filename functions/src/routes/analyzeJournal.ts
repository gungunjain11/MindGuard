import { genAI } from "../services/geminiService";
import type { SimilarEntry } from "../types/api";
import type { Insight } from "../types/ai";
import { generateEmbedding } from "../services/embeddingService";
import { saveJournalEmbedding, getRecentInsights, saveInsight } from "../services/firestoreService";
import { generateIntervention } from "../models/interventionService";
import { retrievePatterns } from "../models/triggerDetector";
import { SchemaType, Schema } from "@google/generative-ai";

interface AnalyzeJournalInput {
  uid: string;
  journalId: string;
  journalText: string;
  similarEntries?: SimilarEntry[];
}

interface GeminiInsightResponse {
  chainOfThought: string;
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

// ─── Schema Definition ────────────────────────────────────────────────────────

const insightSchema = {
  description: "Analysis of the student's journal entry",
  type: SchemaType.OBJECT,
  properties: {
    chainOfThought: {
      type: SchemaType.STRING,
      description: "Internal reasoning block. Think step-by-step about the student's emotional state, history, and triggers before generating the final fields."
    },
    emotions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "2 to 4 short emotion labels like 'anxious', 'exhausted'"
    },
    stressors: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "specific triggers mentioned or implied"
    },
    dominantMood: {
      type: SchemaType.STRING,
      description: "single word describing overall mood"
    },
    urgencyLevel: {
      type: SchemaType.STRING,
      description: "Urgency risk level. Must be 'low', 'medium', or 'high'"
    },
    summary: {
      type: SchemaType.STRING,
      description: "1 to 2 sentences, empathetic, written directly to the student using 'you'. Acknowledge patterns if present."
    },
    topContributors: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "2 to 3 main factors behind their current state"
    },
    immediateAction: {
      type: SchemaType.STRING,
      description: "one concrete thing they can do tonight"
    },
    weeklyAction: {
      type: SchemaType.STRING,
      description: "one adjustment they can make this week for better balance"
    },
    historicalPattern: {
      type: SchemaType.STRING,
      description: "1 sentence describing what recurring pattern you notice across past + current entries, or 'No clear pattern yet'"
    }
  },
  required: ["chainOfThought", "emotions", "stressors", "dominantMood", "urgencyLevel", "summary", "topContributors", "immediateAction", "weeklyAction", "historicalPattern"]
} as Schema;

// ─── Prompt Builder ───────────────────────────────────────────────────────────

const buildHistoryContext = (similarEntries: SimilarEntry[]): string => {
  if (!similarEntries || similarEntries.length === 0) {
    return "No similar past entries found. This appears to be one of the student's first entries.";
  }

  const formatted = similarEntries.map((entry, i) => {
    const when =
      entry.daysAgo === 0
        ? "today"
        : entry.daysAgo === 1
        ? "yesterday"
        : `${entry.daysAgo} days ago`;

    return `Past entry ${i + 1} (written ${when}, similarity: ${Math.round(entry.similarity * 100)}%):
- Mood: ${entry.dominantMood}
- Emotions: ${entry.emotions.join(", ")}
- Stressors: ${entry.stressors.join(", ")}
- Risk level: ${entry.riskLevel}
- Summary: ${entry.aiSummary}`;
  });

  return formatted.join("\n\n");
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
  }

  const historyBlock = buildHistoryContext(similarEntries);
  const hasHistory = similarEntries.length > 0;

  // Initialize model with System Instructions and Schema (Advanced Prompting)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are a compassionate student wellness assistant and expert psychologist with memory of this student's past journal entries. Your task is to analyze the journal entry, identify stress triggers, and provide actionable interventions.",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: insightSchema
    }
  });

  const prompt = `
PAST SIMILAR ENTRIES (RAG Context):
${historyBlock}

${hasHistory ? "Use the past entries to identify whether feelings are recurring and to personalize your response." : "Respond based only on the current entry as no history is available yet."}

CURRENT JOURNAL ENTRY:
"${journalText}"
`;

  try {
    const result = await model.generateContent(prompt);
    // Since we use responseSchema, the text is guaranteed to be matching JSON format!
    const parsed: GeminiInsightResponse = JSON.parse(result.response.text());

    // Fallback for urgencyLevel enum just in case
    const validLevels = ["low", "medium", "high"];
    if (!validLevels.includes(parsed.urgencyLevel)) {
      parsed.urgencyLevel = "medium";
    }

    const baseInsight = {
      uid,
      journalId,
      chainOfThought: parsed.chainOfThought,
      emotions: parsed.emotions,
      stressors: parsed.stressors,
      dominantMood: parsed.dominantMood,
      riskLevel: parsed.urgencyLevel as "low" | "medium" | "high",
      aiSummary: parsed.summary,
      topContributors: parsed.topContributors,
      immediateAction: parsed.immediateAction,
      weeklyAction: parsed.weeklyAction,
      historicalPattern: parsed.historicalPattern,
      ragContextDetails: similarEntries.map(e => ({ daysAgo: e.daysAgo, similarity: e.similarity }))
    };

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
      immediateAction: intervention?.immediateAction ?? baseInsight.immediateAction,
      weeklyAction: intervention?.studyAdjustment ?? baseInsight.weeklyAction,
      motivationalNote: intervention?.motivationalNote ?? null,
    };

    await saveInsight(finalInsight as any);
    return finalInsight;
  } catch (error) {
    console.error("Gemini analyzeJournal error:", error);
    throw new Error("Failed to analyze journal. Please try again.");
  }
};