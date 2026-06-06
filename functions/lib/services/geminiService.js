"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddingModel = exports.geminiModel = exports.genAI = void 0;
const generative_ai_1 = require("@google/generative-ai");
exports.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
exports.geminiModel = exports.genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
});
exports.embeddingModel = exports.genAI.getGenerativeModel({
    model: "text-embedding-004",
});
//# sourceMappingURL=geminiService.js.map