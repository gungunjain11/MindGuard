"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbedding = void 0;
const geminiService_1 = require("./geminiService");
const generateEmbedding = async (text) => {
    if (!text || text.trim().length < 5) {
        throw new Error("Text too short to embed.");
    }
    const result = await geminiService_1.embeddingModel.embedContent(text.trim());
    return result.embedding.values;
};
exports.generateEmbedding = generateEmbedding;
//# sourceMappingURL=embeddingService.js.map