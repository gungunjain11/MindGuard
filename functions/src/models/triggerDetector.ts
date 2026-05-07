import type { Insight, PatternSummary } from "../types/ai";

export const retrievePatterns = (insights: Insight[]): PatternSummary => {
  if (insights.length === 0) {
    return {
      recurringTriggers: [],
      frequencyMap: {},
      dominantEmotions: [],
      weeklyTrend: "stable",
    };
  }

  const allStressors = insights.flatMap((i) => i.stressors);
  const allEmotions = insights.flatMap((i) => i.emotions);

  const stressorCounts: Record<string, number> = {};
  for (const s of allStressors) {
    stressorCounts[s] = (stressorCounts[s] || 0) + 1;
  }

  const emotionCounts: Record<string, number> = {};
  for (const e of allEmotions) {
    emotionCounts[e] = (emotionCounts[e] || 0) + 1;
  }

  const recurringTriggers = Object.entries(stressorCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([trigger]) => trigger);

  const dominantEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emotion]) => emotion);

  const recentInsights = insights.slice(0, 7);
  const avgRisk = recentInsights.reduce((sum, i) => {
    const riskNum = i.riskLevel === "high" ? 3 : i.riskLevel === "medium" ? 2 : 1;
    return sum + riskNum;
  }, 0) / recentInsights.length;

  const weeklyTrend: "improving" | "declining" | "stable" =
    avgRisk < 1.5 ? "improving" : avgRisk > 2.5 ? "declining" : "stable";

  return {
    recurringTriggers,
    frequencyMap: stressorCounts,
    dominantEmotions,
    weeklyTrend,
  };
};