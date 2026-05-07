export interface Insight {
  id?: string;
  journalId: string;
  emotions: string[];
  stressors: string[];
  riskLevel: "low" | "medium" | "high";
  aiSummary: string;
  topContributors: string[];
  immediateAction: string;
  weeklyAction: string;
  createdAt?: unknown;
}
