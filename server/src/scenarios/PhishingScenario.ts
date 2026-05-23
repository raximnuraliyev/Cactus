import { BaseScenario } from './BaseScenario.js';

export class PhishingScenario extends BaseScenario {
  getAvailableTools(): string[] {
    return [
      'check_email_headers',
      'verify_sender_domain',
      'check_link_url',
      'reverse_image_search',
    ];
  }

  getRedFlags(): string[] {
    return [
      'Mismatched or suspicious sender email domain',
      'Urgency or threats demanding immediate action',
      'Requests for sensitive personal information',
      'Generic greetings instead of personalized salutation',
      'Poor grammar or spelling errors',
      'Suspicious links that don\'t match the official domain',
      'Requests to bypass normal verification procedures',
      'Threatening account suspension or legal action',
    ];
  }

  getTrustSignals(): string[] {
    return [
      'Email from official company domain',
      'Personalized greeting with correct name',
      'References verifiable internal procedures',
      'Provides official callback numbers',
      'No requests for passwords or full account numbers',
      'Professional formatting and language',
      'Reasonable timeline for response',
    ];
  }

  protected getToolDescriptions(): Record<string, string> {
    return {
      check_email_headers: 'Analyze the email headers to verify the sending server and check for spoofing indicators',
      verify_sender_domain: 'Look up the sender\'s email domain to verify it belongs to the claimed organization',
      check_link_url: 'Inspect any links in the email to see where they actually lead',
      reverse_image_search: 'Search for the sender\'s profile image to check if it\'s stolen from elsewhere',
    };
  }
}
