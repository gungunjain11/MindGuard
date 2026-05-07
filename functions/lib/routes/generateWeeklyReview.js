"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWeeklyReview = void 0;
const geminiService_1 = require("../services/geminiService");
const buildPrompt = (checkins, insights, uid) => {
    const avgMood = checkins.reduce((s, c) => s + c.mood, 0) / (checkins.length || 1);
    const avgStress = checkins.reduce((s, c) => s + c.stress, 0) / (checkins.length || 1);
    const avgSleep = checkins.reduce((s, c) => s + c.sleepHours, 0) / (checkins.length || 1);
    const allStressors = insights.flatMap((i) => i.stressors);
    const allEmotions = insights.flatMap((i) => i.emotions);
    const stressorCounts = {};
    for (const s of allStressors) {
        stressorCounts[s] = (stressorCounts[s] || 0) + 1;
    }
    const topStressors = Object.entries(stressorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([s]) => s);
    return `
You are a compassionate student wellness coach writing a weekly review.
Return ONLY a valid JSON object — no extra text, no markdown, no backticks.

The JSON must have exactly these fields:
{
  "aiNarrative": "",
  "topTriggers": [],
  "positiveChanges": [],
  "nextWeekRecommendation": ""
}

Field rules:
- aiNarrative: 3 to 4 sentences summarizing the student's week empathetically
- topTriggers: up to 3 main stressors this week as a list
- positiveChanges: up to 2 things that went well or improved (if none, say what showed resilience)
- nextWeekRecommendation: one clear, actionable focus for next week

Student's week data:
- Average mood (1-10): ${avgMood.toFixed(1)}
- Average stress (1-10): ${avgStress.toFixed(1)}
- Average sleep hours: ${avgSleep.toFixed(1)}
- Number of check-ins: ${checkins.length}
- Number of journal entries: ${insights.length}
- Top stressors this week: ${topStressors.join(", ") || "none recorded"}
- Emotions experienced: ${[...new Set(allEmotions)].join(", ") || "none recorded"}
`;
};
const parseResponse = (rawText) => {
    const cleaned = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    return JSON.parse(cleaned);
};
const generateWeeklyReview = async (uid, checkins, insights) => {
    if (checkins.length === 0) {
        throw new Error("No check-ins found for this week.");
    }
    const avgMood = checkins.reduce((s, c) => s + c.mood, 0) / checkins.length;
    const avgStress = checkins.reduce((s, c) => s + c.stress, 0) / checkins.length;
    const avgSleep = checkins.reduce((s, c) => s + c.sleepHours, 0) / checkins.length;
    const allStressors = insights.flatMap((i) => i.stressors);
    const stressorCounts = {};
    for (const s of allStressors) {
        stressorCounts[s] = (stressorCounts[s] || 0) + 1;
    }
    const topTriggers = Object.entries(stressorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([s]) => s);
    const prompt = buildPrompt(checkins, insights, uid);
    try {
        const result = await geminiService_1.geminiModel.generateContent(prompt);
        const rawText = result.response.text();
        const parsed = parseResponse(rawText);
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        return {
            uid,
            weekStart: weekStart.toISOString().split("T")[0],
            weekEnd: now.toISOString().split("T")[0],
            avgMood: parseFloat(avgMood.toFixed(1)),
            avgStress: parseFloat(avgStress.toFixed(1)),
            avgSleep: parseFloat(avgSleep.toFixed(1)),
            topTriggers: parsed.topTriggers || topTriggers,
            positiveChanges: parsed.positiveChanges || [],
            aiNarrative: parsed.aiNarrative,
            nextWeekRecommendation: parsed.nextWeekRecommendation,
        };
    }
    catch (error) {
        console.error("Gemini generateWeeklyReview error:", error);
        throw new Error("Failed to generate weekly review.");
    }
};
exports.generateWeeklyReview = generateWeeklyReview;
//# sourceMappingURL=generateWeeklyReview.js.map