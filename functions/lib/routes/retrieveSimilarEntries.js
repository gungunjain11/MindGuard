"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveSimilarEntries = void 0;
const firestoreService_1 = require("../services/firestoreService");
// ─── Math ─────────────────────────────────────────────────────────────────────
/**
 * Cosine similarity between two vectors.
 * Returns a value from -1 to 1.  Above 0.75 = very similar meaning.
 */
const cosineSimilarity = (a, b) => {
    if (a.length !== b.length)
        return 0;
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
// ─── Main ─────────────────────────────────────────────────────────────────────
const TOP_K = 3;
const MIN_SIMILARITY = 0.65;
const retrieveSimilarEntries = async (uid, currentVector, currentJournalId) => {
    const [allEmbeddings, recentInsights] = await Promise.all([
        (0, firestoreService_1.getAllJournalEmbeddings)(uid),
        (0, firestoreService_1.getRecentInsights)(uid, 60),
    ]);
    const insightByJournalId = new Map(recentInsights.map((insight) => [insight.journalId, insight]));
    const now = Date.now();
    const scored = allEmbeddings
        .filter((e) => e.journalId !== currentJournalId)
        .map((e) => {
        var _a, _b, _c;
        const similarity = cosineSimilarity(currentVector, e.vector);
        const insight = insightByJournalId.get(e.journalId);
        const createdAt = e.createdAt instanceof Date
            ? e.createdAt
            : (_c = (_b = (_a = e.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : new Date();
        const daysAgo = Math.floor((now - createdAt.getTime()) / 86400000);
        return { e, similarity, insight, daysAgo };
    })
        .filter(({ similarity, insight }) => similarity >= MIN_SIMILARITY && insight !== undefined)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, TOP_K);
    const similarEntries = scored.map(({ e, similarity, insight, daysAgo }) => ({
        journalId: e.journalId,
        similarity: Math.round(similarity * 100) / 100,
        emotions: insight.emotions,
        stressors: insight.stressors,
        dominantMood: insight.dominantMood,
        riskLevel: insight.riskLevel,
        aiSummary: insight.aiSummary,
        daysAgo,
    }));
    return {
        similarEntries,
        hasHistory: allEmbeddings.length > 1,
    };
};
exports.retrieveSimilarEntries = retrieveSimilarEntries;
//# sourceMappingURL=retrieveSimilarEntries.js.map