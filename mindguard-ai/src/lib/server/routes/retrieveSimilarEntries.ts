import { getAllJournalEmbeddings, getRecentInsights } from "../services/firestoreService";

// ─── Math ─────────────────────────────────────────────────────────────────────

/**
 * Cosine similarity between two vectors.
 * Returns a value from -1 to 1.  Above 0.75 = very similar meaning.
 */
const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
};

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Main ─────────────────────────────────────────────────────────────────────

const TOP_K = 3;
const MIN_SIMILARITY = 0.65;

export const retrieveSimilarEntries = async (
  uid: string,
  currentVector: number[],
  currentJournalId: string
): Promise<RetrievalResult> => {
  const [allEmbeddings, recentInsights] = await Promise.all([
    getAllJournalEmbeddings(uid),
    getRecentInsights(uid, 60),
  ]);

  const insightByJournalId = new Map(
    recentInsights.map((insight) => [insight.journalId, insight])
  );

  const now = Date.now();

  const scored = allEmbeddings
    .filter((e) => e.journalId !== currentJournalId)
    .map((e) => {
      const similarity = cosineSimilarity(currentVector, e.vector);
      const insight = insightByJournalId.get(e.journalId);
      const createdAt = e.createdAt instanceof Date
        ? e.createdAt
        : (e.createdAt as any)?.toDate?.() ?? new Date();
      const daysAgo = Math.floor((now - createdAt.getTime()) / 86_400_000);

      return { e, similarity, insight, daysAgo };
    })
    .filter(
      ({ similarity, insight }) =>
        similarity >= MIN_SIMILARITY && insight !== undefined
    )
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, TOP_K);

  const similarEntries: SimilarEntry[] = scored.map(
    ({ e, similarity, insight, daysAgo }) => ({
      journalId: e.journalId,
      similarity: Math.round(similarity * 100) / 100,
      emotions: insight!.emotions,
      stressors: insight!.stressors,
      dominantMood: insight!.dominantMood,
      riskLevel: insight!.riskLevel,
      aiSummary: insight!.aiSummary,
      daysAgo,
    })
  );

  return {
    similarEntries,
    hasHistory: allEmbeddings.length > 1,
  };
};