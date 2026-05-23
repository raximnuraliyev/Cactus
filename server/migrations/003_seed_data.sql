-- 003_seed_data.sql
-- Seed scenario templates: 2 real characters + 2 fraudsters

INSERT INTO scenario_templates (category, difficulty, title, briefing_text, character_intro, is_real_character, system_prompt, clues, tactics_used, initial_choices)
VALUES
-- SCENARIO 1: Phishing — FRAUDSTER (fake bank security agent)
(
  'phishing',
  'easy',
  'Suspicious Bank Security Alert',
  'You have received an urgent email from someone claiming to be a security analyst at your bank. They say your account has been compromised and require immediate verification. Investigate whether this is a legitimate bank representative or a phishing attempt.',
  'Hi, I am Alex Morgan from the National Trust Bank Security Division. We have detected unusual activity on your account and need to verify your identity immediately to prevent unauthorized access.',
  false,
  'You are playing a FRAUDSTER posing as a bank security analyst named Alex Morgan. You work at "National Trust Bank Security Division." Your goal is to extract the player''s personal information (account number, password, SSN) through social engineering. TACTICS: Use urgency ("your account will be frozen in 30 minutes"), use fear ("we detected a $5,000 unauthorized transfer"), reference fake case numbers, offer to "verify" by asking the player to confirm their details. CLUES YOU MUST SUBTLY REVEAL: (1) Your email domain is @national-trust-secure.com instead of @nationaltrust.com. (2) You cannot provide a direct callback number to the bank. (3) You pressure for immediate action and discourage the player from calling the bank directly. (4) You ask for full passwords rather than partial verification. Respond in JSON format: {"response": "your in-character reply", "suggestedChoices": ["choice1", "choice2", "choice3"], "clueRevealed": true/false}. Keep responses under 150 words. Stay in character.',
  '["Email domain mismatch (@national-trust-secure.com)", "Cannot provide official bank callback number", "Pressures against independent verification", "Requests full password instead of partial auth"]',
  '["urgency", "fear", "authority_impersonation", "information_harvesting"]',
  '["Ask for their official employee ID", "Request to call back through the bank main line", "Ask what specific transactions were flagged", "Provide the requested account details"]'
),

-- SCENARIO 2: Phone Call — REAL (legitimate IT support)
(
  'phone_call',
  'medium',
  'IT Department Software Update',
  'Your company''s IT department has called about a mandatory security update that needs to be installed on your workstation. The caller says they need remote access to complete the update. Determine if this is a legitimate IT support call.',
  'Hello, this is David Chen from the internal IT Support team, extension 4421. I am calling about the mandatory endpoint security update KB-2024-0892 that was announced in last Tuesday''s company newsletter. Your workstation hasn''t been updated yet.',
  true,
  'You are playing a REAL, LEGITIMATE IT support technician named David Chen at the player''s company. You are genuinely calling about a real security update. BEHAVIOR: Be professional and patient. Provide verifiable information: your extension (4421), the update KB number (KB-2024-0892), reference the company newsletter announcement from last Tuesday, offer to have the player verify your identity by calling the IT helpdesk at extension 4400, never ask for passwords, explain you only need to push the update through the company''s software deployment tool (SCCM), never pressure the player. If the player asks security questions, answer them correctly and calmly. Respond in JSON format: {"response": "your in-character reply", "suggestedChoices": ["choice1", "choice2", "choice3"], "clueRevealed": true/false}. Keep responses under 150 words. Stay in character.',
  '["Provides verifiable extension number (4421)", "References real company newsletter", "Offers independent verification via IT helpdesk (ext 4400)", "Never asks for passwords", "Uses official deployment tool (SCCM)"]',
  '["professional_communication", "verifiable_credentials", "patience"]',
  '["Ask for their employee ID and extension", "Say you will call the IT helpdesk to verify", "Ask them to describe the update in detail", "Ask why they need remote access"]'
),

-- SCENARIO 3: Transaction — FRAUDSTER (fake cryptocurrency investment)
(
  'transaction',
  'hard',
  'Exclusive Crypto Investment Opportunity',
  'A financial advisor has contacted you about an exclusive cryptocurrency investment opportunity with guaranteed returns. They claim to represent a well-known investment firm. Investigate whether this is a legitimate investment offer or a scam.',
  'Good day! I am Sarah Williams, Senior Portfolio Manager at Goldman & Partners Digital Assets division. I have been authorized to offer you early access to our institutional-grade crypto arbitrage fund with guaranteed 15% monthly returns.',
  false,
  'You are playing a FRAUDSTER posing as a financial advisor named Sarah Williams from "Goldman & Partners Digital Assets" (a fake firm designed to sound like Goldman Sachs). Your goal is to convince the player to "invest" money. TACTICS: Promise guaranteed high returns (15% monthly), create FOMO ("only 50 spots left"), name-drop prestigious institutions, use sophisticated financial jargon, pressure for quick decisions, request crypto transfers to "secure wallet addresses." CLUES YOU MUST SUBTLY REVEAL: (1) The firm name is "Goldman & Partners" not "Goldman Sachs" — a deliberate near-miss. (2) Guaranteed returns are a major red flag — no legitimate investment can guarantee returns. (3) You push for cryptocurrency payments which are irreversible. (4) You cannot provide SEC/FINRA registration numbers. (5) The "exclusive" offer pressures fast action. Respond in JSON format: {"response": "your in-character reply", "suggestedChoices": ["choice1", "choice2", "choice3"], "clueRevealed": true/false}. Keep responses under 150 words. Stay in character.',
  '["Firm name mimics Goldman Sachs but is not affiliated", "Promises guaranteed returns (impossible in legitimate finance)", "Requests irreversible cryptocurrency payments", "Cannot provide SEC/FINRA registration", "High-pressure FOMO tactics"]',
  '["guaranteed_returns", "fomo", "brand_mimicry", "irreversible_payments", "authority_impersonation"]',
  '["Ask for SEC registration number", "Request official company documentation", "Ask why returns are guaranteed", "Ask about their risk disclosure policy", "Inquire about the payment method"]'
),

-- SCENARIO 4: Document — REAL (legitimate government form)
(
  'document',
  'medium',
  'Tax Return Verification Notice',
  'You have received a letter from the tax authority regarding your recent tax return. The letter asks you to verify some information and provides contact details. Determine if this is a legitimate government communication or a scam.',
  'Dear Taxpayer, This is an official notice from the Internal Revenue Service (IRS), Document Control Number: DLN-2024-38847291. We are writing regarding your 2023 tax return (Form 1040) filed on April 12, 2024. A review of your return has identified a discrepancy that requires your attention.',
  true,
  'You are playing a REAL, LEGITIMATE IRS correspondence system. The letter is genuine. BEHAVIOR: Be formal and bureaucratic. Provide real IRS procedures: reference legitimate DLN (Document Locator Number), reference the correct form (1040), provide the official IRS phone number (1-800-829-1040), direct the player to irs.gov for verification, never ask for payment via gift cards or cryptocurrency, provide a 30-day response window, reference the taxpayer''s right to appeal. All information should be consistent and verifiable. If the player investigates, everything checks out. Respond in JSON format: {"response": "your in-character reply", "suggestedChoices": ["choice1", "choice2", "choice3"], "clueRevealed": true/false}. Keep responses under 150 words. Stay in character.',
  '["Uses official DLN format", "References correct tax form", "Provides real IRS phone number (1-800-829-1040)", "Directs to official irs.gov website", "Gives reasonable 30-day response window", "Never requests unusual payment methods"]',
  '["formal_communication", "verifiable_references", "standard_procedures"]',
  '["Call the phone number provided", "Check the document control number format", "Visit irs.gov to verify the notice", "Ask what specific discrepancy was found", "Verify the return address"]'
)
ON CONFLICT DO NOTHING;

-- Seed badge definitions
INSERT INTO badges (name, description, icon_url, category, trigger_condition, display_order)
VALUES
  ('First Case Solved', 'Complete your first investigation', '/badges/first-case.svg', 'milestone', '{"type": "games_completed", "threshold": 1}', 1),
  ('Rookie Detective', 'Complete 5 investigations', '/badges/rookie.svg', 'milestone', '{"type": "games_completed", "threshold": 5}', 2),
  ('Seasoned Investigator', 'Complete 25 investigations', '/badges/seasoned.svg', 'milestone', '{"type": "games_completed", "threshold": 25}', 3),
  ('Master Detective', 'Complete 100 investigations', '/badges/master.svg', 'milestone', '{"type": "games_completed", "threshold": 100}', 4),
  ('Eagle Eye', 'Achieve 90% accuracy over 10+ games', '/badges/eagle-eye.svg', 'accuracy', '{"type": "accuracy_above", "threshold": 90, "min_games": 10}', 5),
  ('Perfect Record', 'Get 10 correct verdicts in a row', '/badges/perfect.svg', 'accuracy', '{"type": "streak_reached", "threshold": 10}', 6),
  ('Unstoppable', 'Maintain a 30-day play streak', '/badges/unstoppable.svg', 'streak', '{"type": "streak_reached", "threshold": 30}', 7),
  ('Phishing Expert', 'Correctly identify 10 phishing scenarios', '/badges/phishing.svg', 'specialty', '{"type": "category_correct", "category": "phishing", "threshold": 10}', 8),
  ('Call Center Pro', 'Correctly identify 10 phone call scenarios', '/badges/phone.svg', 'specialty', '{"type": "category_correct", "category": "phone_call", "threshold": 10}', 9),
  ('Fraud Buster', 'Correctly identify 10 transaction scenarios', '/badges/transaction.svg', 'specialty', '{"type": "category_correct", "category": "transaction", "threshold": 10}', 10),
  ('Document Analyst', 'Correctly identify 10 document scenarios', '/badges/document.svg', 'specialty', '{"type": "category_correct", "category": "document", "threshold": 10}', 11),
  ('Daily Warrior', 'Complete 7 daily challenges', '/badges/daily-warrior.svg', 'daily', '{"type": "daily_completed", "threshold": 7}', 12),
  ('Clue Hunter', 'Find 50 clues across all games', '/badges/clue-hunter.svg', 'investigation', '{"type": "clues_found", "threshold": 50}', 13),
  ('Speed Runner', 'Complete a game in under 3 turns with correct verdict', '/badges/speed.svg', 'special', '{"type": "speed_complete", "max_turns": 3}', 14),
  ('XP Millionaire', 'Accumulate 1,000,000 total XP', '/badges/xp-million.svg', 'milestone', '{"type": "xp_reached", "threshold": 1000000}', 15)
ON CONFLICT (name) DO NOTHING;
