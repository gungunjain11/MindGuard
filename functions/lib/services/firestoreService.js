"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveWeeklyAnalytics = exports.saveWeeklyReview = exports.getAllJournalEmbeddings = exports.saveJournalEmbedding = exports.getLatestWeeklyReview = exports.getRecentCheckIns = exports.getRecentInsights = exports.saveInsight = exports.getRecentJournals = exports.saveJournal = void 0;
const admin = __importStar(require("firebase-admin"));
const getDb = () => admin.firestore();
// ─── Journals ─────────────────────────────────────────────────────────────────
const saveJournal = async (journal) => {
    const ref = getDb().collection("users").doc(journal.uid).collection("journals");
    const docRef = await ref.add(Object.assign(Object.assign({}, journal), { createdAt: admin.firestore.FieldValue.serverTimestamp() }));
    return docRef.id;
};
exports.saveJournal = saveJournal;
const getRecentJournals = async (uid, count = 14) => {
    const ref = getDb().collection("users").doc(uid).collection("journals");
    const snap = await ref.orderBy("createdAt", "desc").limit(count).get();
    return snap.docs.map((d) => (Object.assign({ id: d.id }, d.data())));
};
exports.getRecentJournals = getRecentJournals;
// ─── Insights ─────────────────────────────────────────────────────────────────
const saveInsight = async (insight) => {
    const ref = getDb().collection("users").doc(insight.uid).collection("insights");
    const docRef = await ref.add(Object.assign(Object.assign({}, insight), { createdAt: admin.firestore.FieldValue.serverTimestamp() }));
    return docRef.id;
};
exports.saveInsight = saveInsight;
const getRecentInsights = async (uid, count = 14) => {
    const ref = getDb().collection("users").doc(uid).collection("insights");
    const snap = await ref.orderBy("createdAt", "desc").limit(count).get();
    return snap.docs.map((d) => (Object.assign({ id: d.id }, d.data())));
};
exports.getRecentInsights = getRecentInsights;
const getRecentCheckIns = async (uid, count = 14) => {
    const ref = getDb().collection("users").doc(uid).collection("checkins");
    const snap = await ref.orderBy("createdAt", "desc").limit(count).get();
    return snap.docs.map((d) => (Object.assign({ id: d.id }, d.data())));
};
exports.getRecentCheckIns = getRecentCheckIns;
const getLatestWeeklyReview = async (uid) => {
    const ref = getDb().collection("users").doc(uid).collection("weeklyReviews");
    const snap = await ref.orderBy("createdAt", "desc").limit(1).get();
    if (snap.empty)
        return null;
    return Object.assign({ id: snap.docs[0].id }, snap.docs[0].data());
};
exports.getLatestWeeklyReview = getLatestWeeklyReview;
// ─── Embeddings ───────────────────────────────────────────────────────────────
const saveJournalEmbedding = async (embedding) => {
    const ref = getDb().collection("users").doc(embedding.uid).collection("embeddings").doc(embedding.journalId);
    await ref.set({
        vector: embedding.vector,
        journalId: embedding.journalId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
};
exports.saveJournalEmbedding = saveJournalEmbedding;
const getAllJournalEmbeddings = async (uid) => {
    const ref = getDb().collection("users").doc(uid).collection("embeddings");
    const snapshot = await ref.get();
    return snapshot.docs.map((docSnap) => (Object.assign({ journalId: docSnap.id, uid }, docSnap.data())));
};
exports.getAllJournalEmbeddings = getAllJournalEmbeddings;
// ─── Weekly Reviews ───────────────────────────────────────────────────────────
const saveWeeklyReview = async (review) => {
    const ref = getDb().collection("users").doc(review.uid).collection("weeklyReviews");
    const docRef = await ref.add(Object.assign(Object.assign({}, review), { createdAt: admin.firestore.FieldValue.serverTimestamp() }));
    return docRef.id;
};
exports.saveWeeklyReview = saveWeeklyReview;
const saveWeeklyAnalytics = async (uid, review) => {
    const weekId = review.weekStart.replace(/-/g, "_");
    const analyticsRef = getDb().collection("analytics").doc(`${uid}_${weekId}`);
    await analyticsRef.set({
        uid,
        weekStart: review.weekStart,
        weekEnd: review.weekEnd,
        avgMood: review.avgMood,
        avgStress: review.avgStress,
        avgSleep: review.avgSleep,
        topTriggers: review.topTriggers,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
};
exports.saveWeeklyAnalytics = saveWeeklyAnalytics;
//# sourceMappingURL=firestoreService.js.map