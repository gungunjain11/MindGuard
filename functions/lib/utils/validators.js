"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUid = exports.validateJournalInput = void 0;
const validateJournalInput = (text) => {
    return Boolean(text && text.trim().length >= 10);
};
exports.validateJournalInput = validateJournalInput;
const validateUid = (uid) => {
    return Boolean(uid && uid.length > 0);
};
exports.validateUid = validateUid;
//# sourceMappingURL=validators.js.map