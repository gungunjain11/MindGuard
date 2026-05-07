import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";

export async function fetchInsightSummary(payload: { currentVector: number[], currentJournalId: string }) {
  const retrieve = httpsCallable(functions, 'retrieveSimilarEntriesFunction');
  const result = await retrieve(payload);
  return result.data;
}
