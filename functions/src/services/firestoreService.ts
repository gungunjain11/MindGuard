import * as admin from "firebase-admin";
import type { CheckIn, Insight, JournalEmbedding, StoredEmbedding, Journal, WeeklyReview } from "../types/ai";

const getDb = () => admin.firestore();

// ─── Journals ─────────────────────────────────────────────────────────────────

export const saveJournal = async (journal: Omit<Journal, "id">): Promise<string> => {
  const ref = getDb().collection("users").doc(journal.uid).collection("journals");
  const docRef = await ref.add({
    ...journal,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return docRef.id;
};

export const getRecentJournals = async (uid: string, count = 14): Promise<Journal[]> => {
  const ref = getDb().collection("users").doc(uid).collection("journals");
  const snap = await ref.orderBy("createdAt", "desc").limit(count).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Journal));
};

// ─── Insights ─────────────────────────────────────────────────────────────────

export const saveInsight = async (insight: Omit<Insight, "id">): Promise<string> => {
  const ref = getDb().collection("users").doc(insight.uid).collection("insights");
  const docRef = await ref.add({
    ...insight,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return docRef.id;
};

export const getRecentInsights = async (uid: string, count = 14): Promise<Insight[]> => {
  const ref = getDb().collection("users").doc(uid).collection("insights");
  const snap = await ref.orderBy("createdAt", "desc").limit(count).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Insight));
};

export const getRecentCheckIns = async (uid: string, count = 14): Promise<CheckIn[]> => {
  const ref = getDb().collection("users").doc(uid).collection("checkins");
  const snap = await ref.orderBy("createdAt", "desc").limit(count).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CheckIn));
};

export const getLatestWeeklyReview = async (uid: string): Promise<WeeklyReview | null> => {
  const ref = getDb().collection("users").doc(uid).collection("weeklyReviews");
  const snap = await ref.orderBy("createdAt", "desc").limit(1).get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as WeeklyReview;
};

// ─── Embeddings ───────────────────────────────────────────────────────────────

export const saveJournalEmbedding = async (embedding: JournalEmbedding): Promise<void> => {
  const ref = getDb().collection("users").doc(embedding.uid).collection("embeddings").doc(embedding.journalId);
  await ref.set({
    vector: embedding.vector,
    journalId: embedding.journalId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
};

export const getAllJournalEmbeddings = async (uid: string): Promise<StoredEmbedding[]> => {
  const ref = getDb().collection("users").doc(uid).collection("embeddings");
  const snapshot = await ref.get();
  return snapshot.docs.map((docSnap) => ({
    journalId: docSnap.id,
    uid,
    ...(docSnap.data() as Omit<StoredEmbedding, "uid" | "journalId">),
  }));
};

// ─── Weekly Reviews ───────────────────────────────────────────────────────────

export const saveWeeklyReview = async (review: Omit<WeeklyReview, "id" | "createdAt">): Promise<string> => {
  const ref = getDb().collection("users").doc(review.uid).collection("weeklyReviews");
  const docRef = await ref.add({
    ...review,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return docRef.id;
};

export const saveWeeklyAnalytics = async (uid: string, review: Omit<WeeklyReview, "id" | "createdAt">): Promise<void> => {
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