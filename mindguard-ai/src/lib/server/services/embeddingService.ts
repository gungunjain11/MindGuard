import { embeddingModel } from "./geminiService";

export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!text || text.trim().length < 5) {
    throw new Error("Text too short to embed.");
  }

  const result = await embeddingModel.embedContent(text.trim());
  return result.embedding.values;
};