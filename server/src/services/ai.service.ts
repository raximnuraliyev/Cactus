import OpenAI from 'openai';
import { env } from '../config/env.js';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': env.APP_URL, // Required by OpenRouter
    'X-Title': 'Cactus Anti-Fraud Training',
  },
});

const FREE_MODELS = [
  'arcee-ai/trinity-large-thinking:free',
  'deepseek/deepseek-chat:free',
  'meta-llama/llama-3-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'cognitivecomputations/dolphin-mixtral-8x7b:free',
  'google/gemma-7b-it:free'
];

export class AIService {
  private static async createCompletionWithFallback(options: Omit<Parameters<typeof openai.chat.completions.create>[0], 'model'>): Promise<any> {
    let lastError: any = null;
    for (const model of FREE_MODELS) {
      try {
        const completion = await openai.chat.completions.create({
          ...options,
          model,
        } as any);
        return completion;
      } catch (err: any) {
        console.warn(`[AI Service] Model ${model} failed: ${err.message}. Trying next...`);
        lastError = err;
      }
    }
    throw lastError || new Error("All free models failed");
  }

  /**
   * Generates a dynamic phishing/fraud scenario for the Training Simulator.
   */
  static async generateTrainingScenario(category: string, userElo: number): Promise<any> {
    const prompt = `You are an expert cybersecurity training architect. Create a dynamic, interactive fraud/phishing scenario for a bank employee.
The category is "${category}" and the difficulty should match a user with an ELO rating of ${userElo} (where 1000 is beginner, 1500 is average, 2000+ is expert).

Respond ONLY with a JSON object in this exact structure:
{
  "title": "Short catchy title",
  "category": "${category}",
  "timeLimit": 60,
  "difficulty": "easy/medium/hard",
  "characterIntro": "Brief intro of the fraudster character",
  "briefing": "The initial situation the user is presented with",
  "isRealCharacter": false,
  "totalClues": 3,
  "clues": ["Clue 1", "Clue 2", "Clue 3"],
  "tactic": "The social engineering tactic used",
  "initialGreeting": "The first message the fraudster says to start the chat"
}`;

    try {
      const completion = await this.createCompletionWithFallback({
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No content received from AI");
      return JSON.parse(content);
    } catch (err) {
      console.error('AI Scenario Generation Error:', err);
      throw new Error('Failed to generate training scenario');
    }
  }

  /**
   * Evaluates a user's free-text response in the Training Simulator.
   */
  static async evaluateTrainingResponse(scenarioContext: string, chatHistory: any[], userResponse: string): Promise<any> {
    const prompt = `You are evaluating a bank employee's response to a simulated fraudster.
Context: ${scenarioContext}
Recent Chat: ${JSON.stringify(chatHistory.slice(-5))}
User Response: "${userResponse}"

Evaluate the user's response. Did they fall for the trick (isCompromised: true) or did they safely handle it or ask the right questions?
Also, act as the fraudster and generate the next reply (if the game isn't over). If the user is compromised or clearly safe, set isGameOver to true.
Calculate XP rewards: awareness (-10 to 10), intuition (-10 to 10), speed (calculate based on efficiency, 0 to 10), resilience (-10 to 10).

Respond ONLY with a JSON object:
{
  "isCompromised": boolean,
  "isGameOver": boolean,
  "fraudsterReply": "The next thing the fraudster says, or the final outcome",
  "rewards": {
    "awareness": number,
    "intuition": number,
    "speed": number,
    "resilience": number
  }
}`;

    try {
      const completion = await this.createCompletionWithFallback({
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No content received from AI");
      return JSON.parse(content);
    } catch (err) {
      console.error('AI Evaluation Error:', err);
      throw new Error('Failed to evaluate response');
    }
  }

  /**
   * Generates a reply for the AI Fraudster bot in the Tournament Comm-Link.
   */
  static async generateCommLinkReply(messages: any[]): Promise<string> {
    const formattedMessages = messages.map(m => ({
      role: m.sender === 'Agent_Fraudster' ? 'assistant' : 'user',
      content: m.type === 'system' ? `[SYSTEM] ${m.content}` : `[${m.sender}] ${m.content}`
    }));

    // System prompt to instruct the AI to play the Fraudster
    const systemMessage = {
      role: 'system',
      content: "You are playing the role of a cunning Fraudster in a multiplayer training game against a Bank Staff member. " +
               "You are chatting over a 'Comm-Link'. Try to deceive them, pressure them, or negotiate a fake deal. " +
               "Keep your responses short, under 3 sentences. Stay in character!"
    };

    try {
      const completion = await this.createCompletionWithFallback({
        messages: [systemMessage, ...formattedMessages] as any,
      });

      return completion.choices[0]?.message?.content || "Connection lost...";
    } catch (err) {
      console.error('AI Comm-Link Error:', err);
      return "[Connection interference... please repeat.]";
    }
  }
}
