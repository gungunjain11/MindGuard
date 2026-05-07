import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";

export async function generateWeeklyReview(uid: string) {
  const generate = httpsCallable(functions, 'generateWeeklyReviewOnDemandFunction');
  const result = await generate();
  return result.data;
}
