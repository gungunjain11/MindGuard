"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWeeklyReviewOnDemand = void 0;
const firestoreService_1 = require("../services/firestoreService");
const generateWeeklyReview_1 = require("./generateWeeklyReview");
const generateWeeklyReviewOnDemand = async (uid) => {
    var _a, _b;
    const lastReview = await (0, firestoreService_1.getLatestWeeklyReview)(uid);
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (lastReview) {
        const lastCreated = lastReview.createdAt instanceof Date
            ? lastReview.createdAt
            : (_b = (_a = lastReview.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (lastCreated && lastCreated.getTime() > weekAgo.getTime()) {
            return Object.assign(Object.assign({}, lastReview), { generated: false, reason: "A weekly review has already been generated within the last 7 days." });
        }
    }
    const checkins = await (0, firestoreService_1.getRecentCheckIns)(uid, 14);
    const insights = await (0, firestoreService_1.getRecentInsights)(uid, 14);
    if (checkins.length === 0) {
        throw new Error("Not enough check-ins to generate a weekly review.");
    }
    const review = await (0, generateWeeklyReview_1.generateWeeklyReview)(uid, checkins, insights);
    await (0, firestoreService_1.saveWeeklyReview)(review);
    await (0, firestoreService_1.saveWeeklyAnalytics)(uid, review);
    return Object.assign(Object.assign({}, review), { generated: true, reason: "Weekly review generated on demand." });
};
exports.generateWeeklyReviewOnDemand = generateWeeklyReviewOnDemand;
//# sourceMappingURL=generateWeeklyReviewOnDemand.js.map