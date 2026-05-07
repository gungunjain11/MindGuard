import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { analyzeJournal } from "./routes/analyzeJournal";
import { retrieveSimilarEntries } from "./routes/retrieveSimilarEntries";
import { generateWeeklyReview } from "./routes/generateWeeklyReview";
import { generateWeeklyReviewOnDemand } from "./routes/generateWeeklyReviewOnDemand";
admin.initializeApp();

export const analyzeJournalFunction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  const { journalId, journalText } = data;
  return await analyzeJournal({ uid: context.auth.uid, journalId, journalText });
});

export const retrieveSimilarEntriesFunction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  const { currentVector, currentJournalId } = data;
  return await retrieveSimilarEntries(context.auth.uid, currentVector, currentJournalId);
});

export const generateWeeklyReviewFunction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  const { checkins, insights } = data;
  return await generateWeeklyReview(context.auth.uid, checkins, insights);
});

export const generateWeeklyReviewOnDemandFunction = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  return await generateWeeklyReviewOnDemand(context.auth.uid);
});