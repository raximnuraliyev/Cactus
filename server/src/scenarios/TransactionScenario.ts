import { BaseScenario } from './BaseScenario.js';

export class TransactionScenario extends BaseScenario {
  getAvailableTools(): string[] {
    return [
      'verify_company_registration',
      'check_regulatory_database',
      'search_scam_reports',
      'verify_payment_method',
    ];
  }

  getRedFlags(): string[] {
    return [
      'Guaranteed high returns with no risk',
      'Pressure to invest immediately (FOMO tactics)',
      'Requests for cryptocurrency or wire transfer payments',
      'Company name mimics a well-known brand',
      'Cannot provide regulatory registration numbers',
      'Unsolicited contact about investment opportunities',
      'Vague or overly complex investment strategy',
      'No verifiable track record or audited financials',
    ];
  }

  getTrustSignals(): string[] {
    return [
      'Registered with financial regulatory authorities (SEC, FINRA, etc.)',
      'Clear risk disclosures and disclaimers',
      'Audited financial history available',
      'Official company registration verifiable',
      'Standard payment methods through regulated institutions',
      'No pressure to invest immediately',
      'Transparent fee structure',
    ];
  }

  protected getToolDescriptions(): Record<string, string> {
    return {
      verify_company_registration: 'Search business registries to verify the company is legally registered',
      check_regulatory_database: 'Check SEC, FINRA, or other regulatory databases for the advisor\'s registration',
      search_scam_reports: 'Search scam reporting databases and consumer protection sites for complaints',
      verify_payment_method: 'Evaluate the requested payment method for legitimacy and reversibility',
    };
  }
}
