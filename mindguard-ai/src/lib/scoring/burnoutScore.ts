import { RiskLevel } from "../types/checkin";

type BurnoutInput = {
  mood: number;
  stress: number;
  sleepHours: number;
  studyHours: number;
  socialRating: number;
};

export function calculateBurnoutScore(data: BurnoutInput) {
  const sleepDeficit = Math.max(0, 8 - data.sleepHours);
  const overload = Math.max(0, data.studyHours - 6);
  const lowMood = Math.max(0, 5 - data.mood);
  const lowSocial = Math.max(0, 5 - data.socialRating);

  let score =
    sleepDeficit * 14 +
    data.stress * 12 +
    lowMood * 10 +
    overload * 8 +
    lowSocial * 6;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let level: RiskLevel = "low";
  if (score >= 70) level = "high";
  else if (score >= 40) level = "medium";

  const contributors = [
    sleepDeficit >= 2 ? "sleep deficit" : null,
    data.stress >= 4 ? "high stress" : null,
    overload >= 2 ? "study overload" : null,
    data.mood <= 2 ? "low mood" : null,
    data.socialRating <= 2 ? "social withdrawal" : null
  ].filter(Boolean) as string[];

  return { score, level, contributors };
}
