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
exports.generateWeeklyReviewOnDemandFunction = exports.generateWeeklyReviewFunction = exports.retrieveSimilarEntriesFunction = exports.analyzeJournalFunction = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const analyzeJournal_1 = require("./routes/analyzeJournal");
const retrieveSimilarEntries_1 = require("./routes/retrieveSimilarEntries");
const generateWeeklyReview_1 = require("./routes/generateWeeklyReview");
const generateWeeklyReviewOnDemand_1 = require("./routes/generateWeeklyReviewOnDemand");
admin.initializeApp();
exports.analyzeJournalFunction = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { journalId, journalText } = data;
    return await (0, analyzeJournal_1.analyzeJournal)({ uid: context.auth.uid, journalId, journalText });
});
exports.retrieveSimilarEntriesFunction = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { currentVector, currentJournalId } = data;
    return await (0, retrieveSimilarEntries_1.retrieveSimilarEntries)(context.auth.uid, currentVector, currentJournalId);
});
exports.generateWeeklyReviewFunction = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { checkins, insights } = data;
    return await (0, generateWeeklyReview_1.generateWeeklyReview)(context.auth.uid, checkins, insights);
});
exports.generateWeeklyReviewOnDemandFunction = functions.https.onCall(async (_data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    return await (0, generateWeeklyReviewOnDemand_1.generateWeeklyReviewOnDemand)(context.auth.uid);
});
//# sourceMappingURL=index.js.map