import { getAIClient, AI_MODEL } from '../config/ai.js';

export interface AIResponse {
  response: string;
  suggestedChoices: string[];
  clueRevealed: boolean;
}

export class AIService {
  async generateResponse(
    systemPrompt: string,
    conversationHistory: Array<{ role: string; content: string }>,
    playerInput: string,
    language: string
  ): Promise<AIResponse> {
    const ai = getAIClient();

    const languageInstruction = this.getLanguageInstruction(language);
    const fullSystemPrompt = `${systemPrompt}\n\n${languageInstruction}\n\nIMPORTANT: You MUST respond ONLY with a valid JSON object in this exact format: {"response": "your reply text", "suggestedChoices": ["option1", "option2", "option3"], "clueRevealed": true/false}. Do NOT include any text outside the JSON. Do NOT wrap in markdown code blocks.`;

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Add conversation history
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    // Add current player input
    contents.push({
      role: 'user',
      parts: [{ text: playerInput }],
    });

    try {
      const result = await ai.models.generateContent({
        model: AI_MODEL,
        contents,
        config: {
          systemInstruction: fullSystemPrompt,
          temperature: 0.8,
          maxOutputTokens: 500,
        },
      });

      const text = result.text ?? '';
      return this.parseAIResponse(text);
    } catch (err) {
      console.error('[AIService] Gemini API error:', err);
      return {
        response: 'I apologize, I seem to be experiencing some technical difficulties. Could you please repeat that?',
        suggestedChoices: [
          'Ask them to repeat their last statement',
          'Ask a different question',
          'End the conversation',
        ],
        clueRevealed: false,
      };
    }
  }

  async generateDebrief(
    scenarioTitle: string,
    isRealCharacter: boolean,
    verdictGiven: string,
    verdictCorrect: boolean,
    cluesFound: number,
    cluesTotal: number,
    tactics: string[],
    language: string
  ): Promise<string> {
    const ai = getAIClient();
    const languageInstruction = this.getLanguageInstruction(language);

    const prompt = `Generate a brief debrief for an anti-fraud investigation game. ${languageInstruction}

Scenario: "${scenarioTitle}"
The character was: ${isRealCharacter ? 'REAL (legitimate)' : 'FAKE (fraudster)'}
Player verdict: "${verdictGiven}"
Verdict was: ${verdictCorrect ? 'CORRECT' : 'INCORRECT'}
Clues found: ${cluesFound}/${cluesTotal}
${!isRealCharacter ? `Tactics used by the fraudster: ${tactics.join(', ')}` : ''}

Write a 2-3 paragraph educational debrief that:
1. Explains whether the character was real or fake and why
2. Lists the key red flags or trust signals that were present
3. Gives practical advice for real-life situations
Keep it concise and educational. Do not use markdown formatting.`;

    try {
      const result = await ai.models.generateContent({
        model: AI_MODEL,
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      });

      return result.text ?? 'Debrief generation failed. Please review the scenario details above.';
    } catch (err) {
      console.error('[AIService] Debrief generation error:', err);
      return `The character in "${scenarioTitle}" was ${isRealCharacter ? 'real and legitimate' : 'a fraudster'}. Your verdict was ${verdictCorrect ? 'correct' : 'incorrect'}. You found ${cluesFound} out of ${cluesTotal} clues. Always verify identities independently and never share sensitive information under pressure.`;
    }
  }

  private parseAIResponse(text: string): AIResponse {
    // Try to extract JSON from the response
    let cleaned = text.trim();

    // Remove markdown code blocks if present
    const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
      cleaned = jsonBlockMatch[1]!.trim();
    }

    // Try direct parse first
    try {
      const parsed = JSON.parse(cleaned);
      return {
        response: String(parsed.response || ''),
        suggestedChoices: Array.isArray(parsed.suggestedChoices)
          ? parsed.suggestedChoices.map(String)
          : [],
        clueRevealed: Boolean(parsed.clueRevealed),
      };
    } catch {
      // Try to find JSON within the text
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            response: String(parsed.response || ''),
            suggestedChoices: Array.isArray(parsed.suggestedChoices)
              ? parsed.suggestedChoices.map(String)
              : [],
            clueRevealed: Boolean(parsed.clueRevealed),
          };
        } catch {
          // Fall through
        }
      }

      // Fallback: use raw text as response
      return {
        response: cleaned || 'Could you please repeat that?',
        suggestedChoices: ['Continue the conversation', 'Ask another question', 'Make your verdict'],
        clueRevealed: false,
      };
    }
  }

  private getLanguageInstruction(language: string): string {
    switch (language) {
      case 'ru':
        return 'You MUST respond entirely in Russian (Русский).';
      case 'uz':
        return 'You MUST respond entirely in Uzbek (Oʻzbekcha).';
      default:
        return 'You MUST respond entirely in English.';
    }
  }
}
