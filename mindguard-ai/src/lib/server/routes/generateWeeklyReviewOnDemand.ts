import { getRecentCheckIns, getRecentInsights, getLatestWeeklyReview, saveWeeklyReview, saveWeeklyAnalytics } from "../services/firestoreService";
import { generateWeeklyReview } from "./generateWeeklyReview";
import type { WeeklyReview } from "../types/ai";

export const generateWeeklyReviewOnDemand = async (
  uid: string
): Promise<Omit<WeeklyReview, "id" | "createdAt"> & { generated: boolean; reason: string }> => {
  const lastReview = await getLatestWeeklyReview(uid);
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (lastReview) {
    const lastCreated = lastReview.createdAt instanceof Date
      ? lastReview.createdAt
      : (lastReview.createdAt as any)?.toDate?.();

    if (lastCreated && lastCreated.getTime() > weekAgo.getTime()) {
      return {
        ...lastReview,
        generated: false,
        reason: "A weekly review has already been generated within the last 7 days.",
      };
    }
  }

  const checkins = await getRecentCheckIns(uid, 14);
  const insights = await getRecentInsights(uid, 14);

  if (checkins.length === 0) {
    throw new Error("Not enough check-ins to generate a weekly review.");
  }

  const review = await generateWeeklyReview(uid, checkins, insights);
  await saveWeeklyReview(review);
  await saveWeeklyAnalytics(uid, review);

  return {
    ...review,
    generated: true,
    reason: "Weekly review generated on demand.",
  };
};
