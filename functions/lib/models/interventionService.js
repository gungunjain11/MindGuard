"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIntervention = void 0;
const geminiService_1 = require("../services/geminiService");
const buildPrompt = (insight, patterns) => {
    return `
You are a compassionate student wellness coach. Based on this student's journal insight and recurring patterns, suggest personalized interventions.

Student's current insight:
- Emotions: ${insight.emotions.join(", ")}
- Stressors: ${insight.stressors.join(", ")}
- Dominant mood: ${insight.dominantMood}
- Risk level: ${insight.riskLevel}
- Summary: ${insight.aiSummary}

Recurring patterns:
- Top triggers: ${patterns.recurringTriggers.join(", ") || "none"}
- Dominant emotions: ${patterns.dominantEmotions.join(", ") || "none"}
- Weekly trend: ${patterns.weeklyTrend}

Return ONLY a valid JSON object with exactly these fields:
{
  "immediateAction": "one concrete action for tonight",
  "studyAdjustment": "one weekly study habit change",
  "motivationalNote": "one short encouraging sentence personalized to their mood"
}
`;
};
const parseResponse = (rawText) => {
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
};
const generateIntervention = async (insight, patterns) => {
    const prompt = buildPrompt(insight, patterns);
    try {
        const result = await geminiService_1.geminiModel.generateContent(prompt);
        const rawText = result.response.text();
        return parseResponse(rawText);
    }
    catch (error) {
        console.error("Gemini generateIntervention error:", error);
        throw new Error("Failed to generate intervention.");
    }
};
exports.generateIntervention = generateIntervention;
//# sourceMappingURL=interventionService.js.map