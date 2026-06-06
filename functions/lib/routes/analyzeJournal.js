"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeJournal = void 0;
const geminiService_1 = require("../services/geminiService");
const embeddingService_1 = require("../services/embeddingService");
const firestoreService_1 = require("../services/firestoreService");
const interventionService_1 = require("../models/interventionService");
const triggerDetector_1 = require("../models/triggerDetector");
const generative_ai_1 = require("@google/generative-ai");
// ─── Schema Definition ────────────────────────────────────────────────────────
const insightSchema = {
    description: "Analysis of the student's journal entry",
    type: generative_ai_1.SchemaType.OBJECT,
    properties: {
        chainOfThought: {
            type: generative_ai_1.SchemaType.STRING,
            description: "Internal reasoning block. Think step-by-step about the student's emotional state, history, and triggers before generating the final fields."
        },
        emotions: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: { type: generative_ai_1.SchemaType.STRING },
            description: "2 to 4 short emotion labels like 'anxious', 'exhausted'"
        },
        stressors: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: { type: generative_ai_1.SchemaType.STRING },
            description: "specific triggers mentioned or implied"
        },
        dominantMood: {
            type: generative_ai_1.SchemaType.STRING,
            description: "single word describing overall mood"
        },
        urgencyLevel: {
            type: generative_ai_1.SchemaType.STRING,
            description: "Urgency risk level. Must be 'low', 'medium', or 'high'"
        },
        summary: {
            type: generative_ai_1.SchemaType.STRING,
            description: "1 to 2 sentences, empathetic, written directly to the student using 'you'. Acknowledge patterns if present."
        },
        topContributors: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: { type: generative_ai_1.SchemaType.STRING },
            description: "2 to 3 main factors behind their current state"
        },
        immediateAction: {
            type: generative_ai_1.SchemaType.STRING,
            description: "one concrete thing they can do tonight"
        },
        weeklyAction: {
            type: generative_ai_1.SchemaType.STRING,
            description: "one adjustment they can make this week for better balance"
        },
        historicalPattern: {
            type: generative_ai_1.SchemaType.STRING,
            description: "1 sentence describing what recurring pattern you notice across past + current entries, or 'No clear pattern yet'"
        }
    },
    required: ["chainOfThought", "emotions", "stressors", "dominantMood", "urgencyLevel", "summary", "topContributors", "immediateAction", "weeklyAction", "historicalPattern"]
};
// ─── Prompt Builder ───────────────────────────────────────────────────────────
const buildHistoryContext = (similarEntries) => {
    if (!similarEntries || similarEntries.length === 0) {
        return "No similar past entries found. This appears to be one of the student's first entries.";
    }
    const formatted = similarEntries.map((entry, i) => {
        const when = entry.daysAgo === 0
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
    }
    const historyBlock = buildHistoryContext(similarEntries);
    const hasHistory = similarEntries.length > 0;
    // Initialize model with System Instructions and Schema (Advanced Prompting)
    const model = geminiService_1.genAI.getGenerativeModel({
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
        const parsed = JSON.parse(result.response.text());
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
            riskLevel: parsed.urgencyLevel,
            aiSummary: parsed.summary,
            topContributors: parsed.topContributors,
            immediateAction: parsed.immediateAction,
            weeklyAction: parsed.weeklyAction,
            historicalPattern: parsed.historicalPattern,
            ragContextDetails: similarEntries.map(e => ({ daysAgo: e.daysAgo, similarity: e.similarity }))
        };
        let intervention = null;
        try {
            const recentInsights = await (0, firestoreService_1.getRecentInsights)(uid, 14);
            const patterns = (0, triggerDetector_1.retrievePatterns)(recentInsights);
            intervention = await (0, interventionService_1.generateIntervention)(baseInsight, patterns);
        }
        catch (interventionError) {
            console.warn("Intervention generation failed (non-fatal):", interventionError);
        }
        const finalInsight = Object.assign(Object.assign({}, baseInsight), { immediateAction: (_a = intervention === null || intervention === void 0 ? void 0 : intervention.immediateAction) !== null && _a !== void 0 ? _a : baseInsight.immediateAction, weeklyAction: (_b = intervention === null || intervention === void 0 ? void 0 : intervention.studyAdjustment) !== null && _b !== void 0 ? _b : baseInsight.weeklyAction, motivationalNote: (_c = intervention === null || intervention === void 0 ? void 0 : intervention.motivationalNote) !== null && _c !== void 0 ? _c : null });
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