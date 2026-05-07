"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeJournal = void 0;
const geminiService_1 = require("../services/geminiService");
const embeddingService_1 = require("../services/embeddingService");
const firestoreService_1 = require("../services/firestoreService");
const interventionService_1 = require("../models/interventionService");
const triggerDetector_1 = require("../models/triggerDetector");
// ─── Prompt Builder ───────────────────────────────────────────────────────────
/**
 * Formats the retrieved similar past entries into a readable context block.
 * This is injected into the Gemini prompt so the model can reference history.
 */
const buildHistoryContext = (similarEntries) => {
    if (!similarEntries || similarEntries.length === 0) {
        return "No similar past entries found. This may be one of the student's first entries.";
    }
    const formatted = similarEntries.map((entry, i) => {
        const when = entry.daysAgo === 0
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
const buildPrompt = (journalText, similarEntries) => {
    var _a;
    const hasHistory = similarEntries.length > 0;
    const historyBlock = buildHistoryContext(similarEntries);
    return `
You are a compassionate student wellness assistant with memory of this student's past journal entries.
Analyze the following journal entry written by a college student.
Return ONLY a valid JSON object — no extra text, no markdown, no backticks.

${hasHistory
        ? `You have access to semantically similar past entries from this student.
Use them to identify whether these feelings are recurring and to personalize your response.
Reference specific time frames when relevant (e.g., "similar to how you felt 2 weeks ago").

PAST SIMILAR ENTRIES:
${historyBlock}`
        : "This appears to be one of the student's first journal entries, so respond without referencing past history."}

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
- summary: 1 to 2 sentences, empathetic, written directly to the student using "you"${hasHistory
        ? `. If there's a clear recurring pattern, acknowledge it naturally (e.g., "This week feels similar to what you went through ${(_a = similarEntries[0]) === null || _a === void 0 ? void 0 : _a.daysAgo} days ago...")`
        : ""}
- topContributors: 2 to 3 main factors behind their current state
- immediateAction: one concrete thing they can do tonight
- weeklyAction: one adjustment they can make this week for better balance
- historicalPattern: ${hasHistory
        ? `1 sentence describing what recurring pattern you notice across past + current entries, or "No clear pattern yet" if you don't see one`
        : `"First entry — no historical pattern available yet"`}

CURRENT journal entry:
"${journalText}"
`;
};
// ─── Parser ───────────────────────────────────────────────────────────────────
const parseGeminiResponse = (rawText) => {
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
    return parsed;
};
// ─── Main Export ──────────────────────────────────────────────────────────────
const analyzeJournal = async (input) => {
    var _a, _b, _c;
    const { uid, journalId, journalText, similarEntries = [] } = input;
    if (!journalText || journalText.trim().length < 10) {
        throw new Error("Journal entry is too short to analyze.");
    }
    try {
        const vector = await (0, embeddingService_1.generateEmbedding)(journalText);
        await (0, firestoreService_1.saveJournalEmbedding)({ uid, journalId, vector, createdAt: new Date() });
    }
    catch (embeddingError) {
        console.warn("Embedding save failed (non-fatal):", embeddingError);
        // non-fatal — analysis still proceeds even if embedding fails
    }
    const prompt = buildPrompt(journalText, similarEntries);
    try {
        const result = await geminiService_1.geminiModel.generateContent(prompt);
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
            const recentInsights = await (0, firestoreService_1.getRecentInsights)(uid, 14);
            const patterns = (0, triggerDetector_1.retrievePatterns)(recentInsights);
            intervention = await (0, interventionService_1.generateIntervention)(baseInsight, patterns);
        }
        catch (interventionError) {
            console.warn("Intervention generation failed (non-fatal):", interventionError);
        }
        const finalInsight = Object.assign(Object.assign({}, baseInsight), { 
            // Overwrite with richer intervention if available, fall back to Gemini's basic ones
            immediateAction: (_a = intervention === null || intervention === void 0 ? void 0 : intervention.immediateAction) !== null && _a !== void 0 ? _a : baseInsight.immediateAction, weeklyAction: (_b = intervention === null || intervention === void 0 ? void 0 : intervention.studyAdjustment) !== null && _b !== void 0 ? _b : baseInsight.weeklyAction, motivationalNote: (_c = intervention === null || intervention === void 0 ? void 0 : intervention.motivationalNote) !== null && _c !== void 0 ? _c : null });
        // Save the insight to Firestore so it shows up on the frontend dashboard
        await (0, firestoreService_1.saveInsight)(finalInsight);
        return finalInsight;
    }
    catch (error) {
        console.error("Gemini analyzeJournal error:", error);
        throw new Error("Failed to analyze journal. Please try again.");
    }
};
exports.analyzeJournal = analyzeJournal;
//# sourceMappingURL=analyzeJournal.js.map