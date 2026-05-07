import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";

export async function analyzeJournal(payload: { uid: string; journalId: string; text: string }) {
  const analyze = httpsCallable(functions, 'analyzeJournalFunction');
  const result = await analyze({ 
    uid: payload.uid,
    journalId: payload.journalId, 
    journalText: payload.text 
  });
  return result.data;
}
