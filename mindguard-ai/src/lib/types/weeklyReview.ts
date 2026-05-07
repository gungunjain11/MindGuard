export interface WeeklyReview {
  id?: string;
  averageStress: number;
  averageSleep: number;
  consistencyTrend: string;
  topTriggers: string[];
  aiExplanation: string;
  nextWeekRecommendation: string;
  createdAt?: unknown;
}
