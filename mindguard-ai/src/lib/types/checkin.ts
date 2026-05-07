export type RiskLevel = "low" | "medium" | "high";

export interface Checkin {
  id?: string;
  date: string;
  mood: number;
  stress: number;
  sleepHours: number;
  studyHours: number;
  socialRating: number;
  structuredRiskScore: number;
  structuredRiskLevel: RiskLevel;
  contributors?: string[];
  createdAt?: unknown;
}
