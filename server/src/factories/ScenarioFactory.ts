import { BaseScenario } from '../scenarios/BaseScenario.js';
import { PhishingScenario } from '../scenarios/PhishingScenario.js';
import { PhoneCallScenario } from '../scenarios/PhoneCallScenario.js';
import { TransactionScenario } from '../scenarios/TransactionScenario.js';
import { DocumentScenario } from '../scenarios/DocumentScenario.js';
import type { ScenarioTemplate } from '../repositories/ScenarioRepository.js';

export class ScenarioFactory {
  static create(template: ScenarioTemplate): BaseScenario {
    switch (template.category) {
      case 'phishing':
        return new PhishingScenario(template);
      case 'phone_call':
        return new PhoneCallScenario(template);
      case 'transaction':
        return new TransactionScenario(template);
      case 'document':
        return new DocumentScenario(template);
      default:
        throw new Error(`Unknown scenario category: ${template.category}`);
    }
  }

  static getAvailableTools(category: string): string[] {
    switch (category) {
      case 'phishing':
        return [
          'check_email_headers',
          'verify_sender_domain',
          'check_link_url',
          'reverse_image_search',
        ];
      case 'phone_call':
        return [
          'lookup_phone_number',
          'verify_employee_directory',
          'check_company_website',
          'record_call_notes',
        ];
      case 'transaction':
        return [
          'verify_company_registration',
          'check_regulatory_database',
          'search_scam_reports',
          'verify_payment_method',
        ];
      case 'document':
        return [
          'verify_document_format',
          'check_official_website',
          'verify_contact_info',
          'check_document_metadata',
        ];
      default:
        return [];
    }
  }
}
