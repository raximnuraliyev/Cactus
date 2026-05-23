import type { ScenarioTemplate } from '../repositories/ScenarioRepository.js';

export interface ScenarioContext {
  template: ScenarioTemplate;
  tools: string[];
  redFlags: string[];
  trustSignals: string[];
}

export abstract class BaseScenario {
  protected template: ScenarioTemplate;

  constructor(template: ScenarioTemplate) {
    this.template = template;
  }

  get id(): string {
    return this.template.id;
  }

  get category(): string {
    return this.template.category;
  }

  get difficulty(): string {
    return this.template.difficulty;
  }

  get title(): string {
    return this.template.title;
  }

  get isRealCharacter(): boolean {
    return this.template.is_real_character;
  }

  get clues(): string[] {
    return Array.isArray(this.template.clues)
      ? this.template.clues
      : JSON.parse(this.template.clues as unknown as string);
  }

  get tacticsUsed(): string[] {
    return Array.isArray(this.template.tactics_used)
      ? this.template.tactics_used
      : JSON.parse(this.template.tactics_used as unknown as string);
  }

  abstract getAvailableTools(): string[];
  abstract getRedFlags(): string[];
  abstract getTrustSignals(): string[];

  getContext(): ScenarioContext {
    return {
      template: this.template,
      tools: this.getAvailableTools(),
      redFlags: this.getRedFlags(),
      trustSignals: this.getTrustSignals(),
    };
  }

  getToolDescription(tool: string): string {
    const descriptions = this.getToolDescriptions();
    return descriptions[tool] ?? `Use the ${tool} investigation tool`;
  }

  protected abstract getToolDescriptions(): Record<string, string>;
}
