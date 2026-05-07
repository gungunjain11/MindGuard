import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest"
});

export const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});