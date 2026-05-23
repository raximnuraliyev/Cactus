import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';

let aiClient: GoogleGenAI | null = null;

export function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return aiClient;
}

export const AI_MODEL = 'gemini-2.0-flash';
