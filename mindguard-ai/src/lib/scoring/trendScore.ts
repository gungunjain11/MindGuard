export function calculateTrendLabel(
  checkins: Array<{ mood: number; stress: number; sleepHours: number }>
) {
  if (checkins.length < 2) return "stable";

  const latest = checkins[0];
  const oldest = checkins[checkins.length - 1];

  const moodDiff = latest.mood - oldest.mood;
  const stressDiff = latest.stress - oldest.stress;
  const sleepDiff = latest.sleepHours - oldest.sleepHours;

  if (moodDiff >= 1 && stressDiff <= 0 && sleepDiff >= 0) return "improving";
  if (moodDiff <= -1 || stressDiff >= 1 || sleepDiff <= -1) return "worsening";
  return "stable";
}
