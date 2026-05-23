import { BaseScenario } from './BaseScenario.js';

export class DocumentScenario extends BaseScenario {
  getAvailableTools(): string[] {
    return [
      'verify_document_format',
      'check_official_website',
      'verify_contact_info',
      'check_document_metadata',
    ];
  }

  getRedFlags(): string[] {
    return [
      'Requests for immediate payment via unusual methods (gift cards, crypto)',
      'Threatening language demanding urgent response',
      'Incorrect or unofficial formatting',
      'Contact information that doesn\'t match official sources',
      'Misspelled agency names or incorrect logos',
      'Suspicious return address or sender',
      'Request for sensitive information via email or phone',
      'No case number or reference that can be verified',
    ];
  }

  getTrustSignals(): string[] {
    return [
      'Official document format and letterhead',
      'Verifiable case or document control numbers',
      'Contact information matches official website',
      'Reasonable response timeline (30+ days)',
      'Directs to official website for verification',
      'Standard payment methods through official channels',
      'References correct forms and procedures',
      'Professional and formal tone',
    ];
  }

  protected getToolDescriptions(): Record<string, string> {
    return {
      verify_document_format: 'Compare the document format against known official templates from the agency',
      check_official_website: 'Visit the official agency website to verify the document and its claims',
      verify_contact_info: 'Cross-reference the provided phone numbers and addresses with official sources',
      check_document_metadata: 'Examine the document for hidden metadata, watermarks, or digital signatures',
    };
  }
}
