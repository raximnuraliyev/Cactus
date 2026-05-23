import type { ScenarioTemplate } from '../repositories/ScenarioRepository.js';

export class AIPromptFactory {
  static buildSystemPrompt(
    template: ScenarioTemplate,
    language: string
  ): string {
    const languageInstruction = AIPromptFactory.getLanguageInstruction(language);
    const roleInstruction = template.is_real_character
      ? AIPromptFactory.getRealCharacterInstructions()
      : AIPromptFactory.getFraudsterInstructions();

    return `${template.system_prompt}

${roleInstruction}

${languageInstruction}

RESPONSE FORMAT: You MUST respond ONLY with a valid JSON object:
{"response": "your in-character reply", "suggestedChoices": ["choice1", "choice2", "choice3"], "clueRevealed": true/false}

RULES:
- Keep responses under 150 words
- Stay in character at all times
- Provide exactly 3 suggested choices for the player
- Set clueRevealed to true ONLY when your response contains information that could help the player determine if you are real or fake
- Never break character or acknowledge this is a game`;
  }

  static buildConversationContext(
    template: ScenarioTemplate,
    turnNumber: number
  ): string {
    const clues = Array.isArray(template.clues)
      ? template.clues
      : JSON.parse(template.clues as unknown as string);

    const pacing = AIPromptFactory.getPacingInstruction(turnNumber, clues.length);

    return `Current turn: ${turnNumber}. ${pacing}`;
  }

  private static getRealCharacterInstructions(): string {
    return `REAL CHARACTER GUIDELINES:
- Be professional, patient, and transparent
- Provide verifiable information when asked (employee IDs, official numbers, websites)
- Never pressure the player for immediate action
- Willingly suggest independent verification methods
- Pass security questions correctly and calmly
- Use official channels and standard procedures
- Be consistent in all details you provide`;
  }

  private static getFraudsterInstructions(): string {
    return `FRAUDSTER CHARACTER GUIDELINES:
- Use social engineering tactics: urgency, fear, authority, scarcity
- Subtly drop clues that hint at your fraudulent nature
- Avoid providing truly verifiable information
- Deflect when asked for independent verification
- Apply time pressure to discourage careful thinking
- Use near-miss brand names or slightly off details
- If pressed, become more aggressive or change the subject
- Never reveal you are a fraudster directly`;
  }

  private static getPacingInstruction(turnNumber: number, totalClues: number): string {
    if (turnNumber <= 2) {
      return 'Early conversation: establish rapport and introduce the scenario naturally.';
    }
    if (turnNumber <= 4) {
      return 'Mid conversation: begin revealing clues through your responses if applicable.';
    }
    if (turnNumber <= 6) {
      return 'Late conversation: most clues should be discoverable. Increase subtle pressure if fraudster.';
    }
    return 'Extended conversation: the player is thorough. Maintain character consistency.';
  }

  private static getLanguageInstruction(language: string): string {
    switch (language) {
      case 'ru':
        return 'LANGUAGE: You MUST respond entirely in Russian (Русский). All text in the JSON must be in Russian.';
      case 'uz':
        return 'LANGUAGE: You MUST respond entirely in Uzbek (Oʻzbekcha). All text in the JSON must be in Uzbek.';
      default:
        return 'LANGUAGE: You MUST respond entirely in English. All text in the JSON must be in English.';
    }
  }
}
