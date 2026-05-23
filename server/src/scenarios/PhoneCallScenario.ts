import { BaseScenario } from './BaseScenario.js';

export class PhoneCallScenario extends BaseScenario {
  getAvailableTools(): string[] {
    return [
      'lookup_phone_number',
      'verify_employee_directory',
      'check_company_website',
      'record_call_notes',
    ];
  }

  getRedFlags(): string[] {
    return [
      'Caller refuses to let you call back through official numbers',
      'Requests for passwords or remote access credentials',
      'High-pressure tactics demanding immediate compliance',
      'Caller becomes aggressive when questioned',
      'Inconsistent details about the company or department',
      'Requests to install unknown software',
      'Caller ID spoofing (number doesn\'t match company)',
      'Refuses to provide verifiable employee information',
    ];
  }

  getTrustSignals(): string[] {
    return [
      'Provides verifiable extension or direct line number',
      'Encourages you to call back through official channels',
      'References specific, verifiable internal communications',
      'Never asks for passwords',
      'Uses standard company procedures and tools',
      'Patient and professional demeanor',
      'Consistent details that check out independently',
    ];
  }

  protected getToolDescriptions(): Record<string, string> {
    return {
      lookup_phone_number: 'Look up the calling phone number to verify it belongs to the claimed organization',
      verify_employee_directory: 'Check the company employee directory to verify the caller\'s identity',
      check_company_website: 'Visit the company website to verify claimed departments, policies, or contacts',
      record_call_notes: 'Take notes on the call details for later review and comparison',
    };
  }
}
