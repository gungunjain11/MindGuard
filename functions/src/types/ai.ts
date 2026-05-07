export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  fieldOfStudy: string;
  semester: number;
  workloadLevel: "light" | "moderate" | "heavy";
  baselineScore: number;
  createdAt: Date;
}

export interface CheckIn {
  id?: string;
  uid: string;
  date: string;
  mood: number;          // 1-10
  stress: number;        // 1-10
  sleepHours: number;    // 0-12
  studyHours: number;    // 0-16
  socialRating: number;  // 1-10
  structuredRiskScore: number;
  createdAt: Date;
}

export interface Journal {
  id?: string;
  uid: string;
  text: string;
  createdAt: Date;
  source: "manual";
}

export interface Insight {
  id?: string;
  journalId: string;
  uid: string;
  emotions: string[];
  stressors: string[];
  dominantMood: string;
  riskLevel: "low" | "medium" | "high";
  aiSummary: string;
  immediateAction: string;
  weeklyAction: string;
  topContributors: string[];
  historicalPattern: string;
  motivationalNote: string | null; // Added from intervention generation
  createdAt: Date;
}

export interface WeeklyReview {
  id?: string;
  uid: string;
  weekStart: string;
  weekEnd: string;
  avgStress: number;
  avgSleep: number;
  avgMood: number;
  topTriggers: string[];
  positiveChanges: string[];
  aiNarrative: string;
  nextWeekRecommendation: string;
  createdAt: Date;
}

export interface JournalEmbedding {
  uid: string;
  journalId: string;
  vector: number[];
  createdAt: Date;
}

export interface StoredEmbedding extends JournalEmbedding {
  journalId: string;
}

export interface PatternSummary {
  recurringTriggers: string[];
  frequencyMap: Record<string, number>;
  dominantEmotions: string[];
  weeklyTrend: "improving" | "declining" | "stable";
}

// ─── Burnout Score ────────────────────────────────────────────────────────────
// This is the unified score that merges Person 1's structured score with your AI signal.

export type RiskLabel = "low" | "medium" | "high" | "critical";

export interface UnifiedBurnoutScore {
  // The final merged score (0–100). Higher = more burnout risk.
  score: number;

  // Human-readable label for the score band
  label: RiskLabel;

  // The two inputs that produced this score
  structuredScore: number;        // 0–100, from Person 1's check-in engine
  aiRiskLevel: "low" | "medium" | "high"; // from Gemini's urgencyLevel

  // What drove the score up or down
  dominantSignal: "structured" | "ai" | "both";

  // Short explanation Person 1 can display on the dashboard
  explanation: string;
}