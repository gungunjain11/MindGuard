export interface SimilarEntry {
  journalId: string;
  similarity: number;
  emotions: string[];
  stressors: string[];
  dominantMood: string;
  riskLevel: "low" | "medium" | "high";
  aiSummary: string;
  daysAgo: number;
}

export interface RetrievalResult {
  similarEntries: SimilarEntry[];
  hasHistory: boolean;
}