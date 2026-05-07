"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddingModel = exports.geminiModel = void 0;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
exports.geminiModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest"
});
exports.embeddingModel = genAI.getGenerativeModel({
    model: "text-embedding-004",
});
//# sourceMappingURL=geminiService.js.map