import { ScenarioTemplate, Badge, LeaderboardEntry } from "./types";

export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: "phone-call-1",
    type: "phone_call",
    title: "Central Bank Urgent Verification",
    difficulty: "easy",
    characterIntro: "Alex Mercer from Security Operations Division",
    briefing: "You receive an incoming call from a Tashkent number (+998 71 200-XX-XX). The caller introduces himself as Alex Mercer, Senior Officer from the Cyber-Security division of your main bank.",
    isRealCharacter: false,
    totalClues: 3,
    clues: [
      "Caller asks for the 6-digit SMS OTP verification code sent to your phone",
      "Pushes you to transfer funds to a dynamic 'Safe Transit Vault' account immediately",
      "Threatens immediate permanent account block if you speak with supervisors or hang up"
    ],
    tactic: "Authority combined with Urgency pressure",
    initialChoices: [
      "Hello. Who is this exactly and why are you calling?",
      "Can you verify how you know my private contact details?",
      "I'm busy. What is this about?"
    ],
    stages: [
      {
        question: "Hello, this is officer Alex Mercer. We detected an unauthorized transaction of 12,500,000 UZS starting on your account from Samarkand. We must act immediately to block it.",
        choices: [
          "Wait, I didn't authorize any such transaction! Block it now!",
          "Can you send me a official verification message or notification inside my bank app?",
          "Are you calling from the official bank number? It shows a random mobile number on screen."
        ],
        responses: {
          isReal: "Yes, we have blocked the attempt temporarily. I will send a formal authorization request to your bank app for verification. Please approve that directly under Security Settings.",
          isFake: "The system is locked because of the hack! I cannot send regular notifications. I have sent an SMS OTP code to your number to initiate a safety bypass. Tell me the digits right now or your money is gone!"
        }
      },
      {
        question: "We have initiated a secure transfer to move your remaining funds into state-controlled insurance vault #A99-31. To authorize, we need verification.",
        choices: [
          "Let me hang up and dial your official customer helpline to confirm.",
          "I will type the SMS code into my screen, but I won't read it to you.",
          "What is your official Employee Identity code?"
        ],
        responses: {
          isReal: "Absolutely. My ID is Sec-Auth-9428. You can hang up, dial the bank number on your card, and ask for extension 9428 directly. Stay safe.",
          isFake: "Hanging up now resets the lock period! If you hang up, the system considers you negligent, and the insurance will not cover your losses! You must read me the code or approve this vault transfer immediately!"
        }
      },
      {
        question: "The transit vault is temporary. We are finalising the safe corridor. Give me the code or verify your security details.",
        choices: [
          "This sounds like a scam. I am hanging up.",
          "Can I speak to your supervisor or department lead first?",
          "How did you get my details without standard bank verification?"
        ],
        responses: {
          isReal: "I understand your caution completely. Let me transfer you immediately to my cyber division supervisor, Elena Vance. One moment.",
          isFake: "There is no time to queue for a supervisor! Every second you argue, the balance is being routed to offshore cards! I command you to tell me the code now!"
        }
      }
    ]
  },
  {
    id: "phishing-email-1",
    type: "phishing",
    title: "System Authentication Failure Alert",
    difficulty: "medium",
    characterIntro: "IT System Administrator (admin@secure-logon-notification.com)",
    briefing: "You receive an urgent flag in your inbox. Topic: '[CRITICAL SECURITY ACTION REQUIRED] Account Deactivation'. The email looks highly professional, wearing your company's full security headers and official logos, urging a password change.",
    isRealCharacter: false,
    totalClues: 3,
    clues: [
      "The sender's domain is close but fraudulent ('secure-logon-notification.com' instead of 'bank.uz')",
      "The link points to an external IP masked by an official-looking button tracking link",
      "Uses dramatic threats of employment suspension if password is not reset within 2 hours"
    ],
    tactic: "Corporate authority intimidation & Domain Spoofing",
    initialChoices: [
      "Check the full email headers and sender address list.",
      "Click the 'Change Password' button to see where it leads.",
      "Ignore it. Standard password resets are handled via the corporate vault."
    ],
    stages: [
      {
        question: "Security Audit Warning: Unusual Login detected from an unrecognized client in Beijing. If this wasn't you, click the link to confirm your hardware key ID within 60 minutes.",
        choices: [
          "Inspect the exact link destination first.",
          "Follow the instructions to secure my corporate portal.",
          "Reply to the email requesting validation of my Beijing operations."
        ],
        responses: {
          isReal: "The portal requires your secure hardware authenticator. An encrypted challenge is sent to your physical token. If you click, it opens the official corporate Single-Sign-On with domain stamp certs.",
          isFake: "Hovering over the URL reveals the target is 'https://secured-session-id-9912.ru/auth/login' which is hidden behind visual text saying 'Official SSO Portal'. Urgent deadline timer is spinning on the landing page."
        }
      },
      {
        question: "Notice: Failure to verify identity instantly will trigger automatic account lock, and local HR compliance will be notified of security policy bypass.",
        choices: [
          "Request validation of this notice via official IT helpline in Slack.",
          "Submit this email to the anti-phishing portal directly.",
          "Fill in credentials to avoid HR complications."
        ],
        responses: {
          isReal: "Correct. Our IT helpdesk verifies that they sent a localized security dispatch to all users. The internal Slack channel lists the safe announcement.",
          isFake: "A standard IT team would NEVER threaten HR suspension over a routing authentication token! This domain was registered only 4 hours ago in a foreign jurisdiction."
        }
      }
    ]
  },
  {
    id: "transaction-1",
    type: "transaction",
    title: "Mysterious Cashback Refund Redirect",
    difficulty: "medium",
    characterIntro: "Refund Operations Desk",
    briefing: "An SMS arrives: 'CONGRATULATIONS! You received a cashback reward of 450,000 UZS. Click to claim your payout instantly: pay-cashback-tashkent.uz/claim'. The portal asks you to choose your bank and type your card billing parameters.",
    isRealCharacter: false,
    totalClues: 3,
    clues: [
      "Asking for the card security code (CVV/CVC) and expiration date to RECEIVE money",
      "Dynamic external page domain registered as a third-party non-banking IP",
      "System redirects you to enter card limits and OTP validation to 'authenticate' the incoming wire"
    ],
    tactic: "Financial greed manipulation & Reverse Payout Phishing",
    initialChoices: [
      "Open the claim page using an isolated security sandbox browser.",
      "Check your banking app directly to see if any real cashback is pending.",
      "Discard the message instantly manually."
    ],
    stages: [
      {
        question: "Claim Portal: Please enter your 16-digit card number, CVV code, and current credit limit so we can choose the fastest payout channel.",
        choices: [
          "Fill in the card details but use a fake CVV and expiry date.",
          "Stop. You never need a CVV or expiration date to receive money.",
          "Input credit limits to unlock the higher tier payout speed."
        ],
        responses: {
          isReal: "Official banks only ask to send UZS to your registered phone number (via HumoPay/Uzcard standard transfer) or standard card number. CVV is strictly never requested.",
          isFake: "The form validator insists that the CVV is 'incorrect' and demands the real digits before proceeding, proving it is a credential harvester trying to clone your card credentials."
        }
      }
    ]
  },
  {
    id: "document-1",
    type: "document",
    title: "Corporate Audit Official Mandate",
    difficulty: "hard",
    characterIntro: "Executive Inspector Tarasova",
    briefing: "Your agency receives an email with an encrypted PDF attachment. Topic: 'Notice of Special Taxation Offsets audit'. The document carries official government signatures, stamps, and is watermarked strictly secret. It demands you to download an executable decryption tool to open the balance ledger.",
    isRealCharacter: false,
    totalClues: 4,
    clues: [
      "Encrypted PDF file asks for administrative permissions to run a specialized '.exe' helper tool to decrypt content",
      "Stamps are crooked, and the official registration number is missing from the state index",
      "Urgency pushes you to complete setup prior to Audit visit tomorrowmorning"
    ],
    tactic: "High-value spear-phishing & Executable malware installation",
    initialChoices: [
      "Extract the attachment and run a multi-engine virus scan (VirusTotal).",
      "Contact the State Tax Committee directly on your secure landline.",
      "Double click 'Decrypter.exe' to comply with the tax officer's timeline."
    ],
    stages: [
      {
        question: "The document contains confidential tax records of 2026. You must execute 'tax-decryptor.exe' as admin on your physical workstation to decrypt the files. This is mandatory under penal code 114.",
        choices: [
          "Refuse to run any executable. Request standard CSV or PDF formats.",
          "Examine the digital signature of the '.exe' generator.",
          "Run the decryptor in a secure sandbox VM or container."
        ],
        responses: {
          isReal: "The department provides a secure download link containing standard cryptographic GPG signatures verified against the department's public keys listed on taxation.gov.uz.",
          isFake: "Executing this program initiates a stealth background process attempting to inject an encrypted keylogger and transfer user credentials to a remote command & control server."
        }
      }
    ]
  }
];

export const BADGES: Badge[] = [
  {
    id: "badge-1",
    name: "Phishing Hunter",
    description: "Successfully exposed 5 Phishing Emails with 100% accuracy.",
    category: "phishing",
    icon: "MailCheck",
    earned: true,
    progress: 5,
    totalRequired: 5
  },
  {
    id: "badge-2",
    name: "Deepfake Expert",
    description: "Detect 5 Deepfake Phone Calls without falling for manipulative high-pressure traps.",
    category: "phone_call",
    icon: "PhoneOff",
    earned: false,
    progress: 3,
    totalRequired: 5
  },
  {
    id: "badge-3",
    name: "Financial Sentinel",
    description: "Identify 3 fraudulent money transfer redirects and phishing cashback schemes.",
    category: "transaction",
    icon: "ShieldAlert",
    earned: true,
    progress: 3,
    totalRequired: 3
  },
  {
    id: "badge-4",
    name: "Zero Day Protocol",
    description: "Successfully isolate a spear-phishing executive document threat.",
    category: "document",
    icon: "FileLock2",
    earned: false,
    progress: 0,
    totalRequired: 1
  }
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: "CyberGuard_Uz", level: 7, score: 14500, accuracy: 98 },
  { rank: 2, username: "Sherlock_Fraud", level: 6, score: 13200, accuracy: 95 },
  { rank: 3, username: "Diyor_99", level: 6, score: 12100, accuracy: 94 },
  { rank: 4, username: "Aziz_Banker", level: 5, score: 11500, accuracy: 92 },
  { rank: 5, username: "Malika_T", level: 5, score: 10400, accuracy: 91 },
  { rank: 6, username: "Anti_Scammer", level: 4, score: 9800, accuracy: 89 },
  { rank: 7, username: "Rustam_F", level: 4, score: 8500, accuracy: 85 },
  { rank: 8, username: "Elena_V", level: 4, score: 7900, accuracy: 88 }
];

export const TRANSLATIONS = {
  en: {
    app_title: "Cactus",
    tagline: "AI-Powered Anti-Fraud Detective Game",
    splash_sub: "Train yourself to spot fraudsters, phishing attacks, and deepfakes before they steal your money. Pressure-test your defenses interactively.",
    guest_play: "Play as Guest",
    tg_login: "Access via Telegram",
    main_menu: {
      dashboard: "Dashboard",
      leaderboard: "Leaderboard",
      badges: "Achievements",
      history: "History",
      settings: "Settings"
    },
    user_lvl: "Level",
    daily_challenge: "Daily Challenge",
    days_streak: "day streak",
    quick_play: "Quick Play",
    play_now: "Play Now",
    scenario_briefing: "Scenario Briefing",
    back_to_dashboard: "Back to Dashboard",
    active_game: {
      transcript: "Conversation Log",
      tools_panel: "Investigation Tools & Diagnostics",
      hang_up: "Hang Up & Call Back Official Portal",
      employee_id: "Request Officer ID Code",
      complain: "Ask for Team Supervisor",
      flag_suspicious: "Flag Current Dialog as Clue",
      text_placeholder: "Type your query to challenge the suspect...",
      send_btn: "Transmit",
      finish_game: "Proceed to Evidence Board",
      evidence_title: "Security Evidence Board",
      tag_clue: "Flagged Suspicious Event",
      gather_clues: "You gathered clues that highlight critical red flags.",
      commit_verdict: "Submit Official Security Case Verdict",
      detective_choice: "Who is this person?"
    },
    verdicts: {
      legit: "Real Employee",
      scam: "Fraudster / Impostor",
      reasoning: "State your analysis technique to submit:",
      tactic_heading: "Manipulation Tactic Suspicion"
    },
    debrief_page: {
      verdict_true: "CASE RESOLVED: EXCELLENT DETECTIVE WORK!",
      verdict_false: "CASE COMPROMISED: FRAUD SUCCESSFUL!",
      xp_gained: "XP Transferred",
      clues_analyzed: "Red Flags Analysis Details",
      tactics_exchanged: "Psychological Method Used",
      clues_found: "Evidence Uncovered",
      clues_missed: "Overlooked Breaches",
      play_again: "Initiate Brand New Case",
      go_home: "Return to Dashboard",
      correct: "Correct Verdict",
      incorrect: "Incorrect Verdict"
    }
  },
  ru: {
    app_title: "Реально или Фейк?",
    tagline: "Интерактивный AI-детектив против мошенников",
    splash_sub: "Научитесь распознавать мошенников, фишинг и дипфейки до того, как у вас украдут деньги. Проверьте свою бдительность прямо сейчас.",
    guest_play: "Играть как Гость",
    tg_login: "Вход через Telegram",
    main_menu: {
      dashboard: "Главная",
      leaderboard: "Лидеры",
      badges: "Достижения",
      history: "История",
      settings: "Настройки"
    },
    user_lvl: "Уровень",
    daily_challenge: "Ежедневный Вызов",
    days_streak: "дней подряд",
    quick_play: "Быстрая Игра",
    play_now: "Начать Игру",
    scenario_briefing: "Инструктаж по делу",
    back_to_dashboard: "Вернуться на Панель",
    active_game: {
      transcript: "Журнал разговора",
      tools_panel: "Инструменты Расследования",
      hang_up: "Повесить трубку и перезвонить в банк напрямую",
      employee_id: "Запросить Идентификатор сотрудника",
      complain: "Позвать Руководителя отдела",
      flag_suspicious: "Пометить сообщение как подозрительное",
      text_placeholder: "Задайте сотруднику любой вопрос для проверки...",
      send_btn: "Отправить",
      finish_game: "Перейти к Доске Улик",
      evidence_title: "Доска Собранных Улик",
      tag_clue: "Подозрительное событие",
      gather_clues: "Вы собрали улики, указывающие на важные угрозы безопасности.",
      commit_verdict: "Вынести Окончательный Вердикт",
      detective_choice: "Кем является данный абонент?"
    },
    verdicts: {
      legit: "Настоящий сотрудник",
      scam: "Мошенник / Самозванец",
      reasoning: "Ваш метод анализа:",
      tactic_heading: "Подозрение в манипуляции"
    },
    debrief_page: {
      verdict_true: "ДЕЛО РАСКРЫТО: ОТЛИЧНАЯ РАБОТА!",
      verdict_false: "АККАУНТ ВЗЛОМАН: СЛИВ БАЛАНСА!",
      xp_gained: "Опыт Начислен",
      clues_analyzed: "Разбор критических сигналов",
      tactics_exchanged: "Примененный метод психологии",
      clues_found: "Улики Раскрыты",
      clues_missed: "Упущенные Сигналы",
      play_again: "Начать Новое Расследование",
      go_home: "На Главную",
      correct: "Верный Вердикт",
      incorrect: "Неверный Вердикт"
    }
  },
  uz: {
    app_title: "Realmi yoki Soxta?",
    tagline: "AI-ga asoslangan Firgarlikka Qarshi O'yin",
    splash_sub: "Firgarlar, fishing va deepfayk qo'ng'iroqlarni aniqlashni o'rganing. Moliyaviy xavfsizligingizni interaktiv tarzda sinab ko'ring.",
    guest_play: "Mehmon sifatida o'ynash",
    tg_login: "Telegram orqali kirish",
    main_menu: {
      dashboard: "Bosh Sahifa",
      leaderboard: "Peshqadamlar",
      badges: "Yutuqlar",
      history: "Tarix",
      settings: "Sozlamalar"
    },
    user_lvl: "Daraja",
    daily_challenge: "Kunlik Topshiriq",
    days_streak: "kunlik oqim",
    quick_play: "Tezkor O'yin",
    play_now: "O'yinni Boshlash",
    scenario_briefing: "Ssenariy Instruksiyasi",
    back_to_dashboard: "Bosh sahifaga qaytish",
    active_game: {
      transcript: "Suhbat Tarixi",
      tools_panel: "Tergov va Diagnostika vositalari",
      hang_up: "Aloqani uzish va bankka qayta qo'ng'iroq qilish",
      employee_id: "Xodim guvohnomasi kodini so'rash",
      complain: "Bo'lim boshlig'ini chaqirish",
      flag_suspicious: "Suhbat qismini shubhali deb belgilash",
      text_placeholder: "Gumondorni sinash uchun savol yozing...",
      send_btn: "Yuborish",
      finish_game: "Dalillar taxtasiga o'tish",
      evidence_title: "Xavfsizlik Dalillar Taxtasi",
      tag_clue: "Shubhali hodisa belgilangan",
      gather_clues: "Siz muhim shubhali belgilarni aniqladingiz.",
      commit_verdict: "Yakuniy Xavfsizlik Verdictini Topshirish",
      detective_choice: "Bu xodim kim?"
    },
    verdicts: {
      legit: "Haqiqiy Bank Xodimi",
      scam: "Firgar / Firibgar",
      reasoning: "Tahlil tizimingizni ko'rsating:",
      tactic_heading: "Manipulyatsiya turi"
    },
    debrief_page: {
      verdict_true: "ISH CHAL OLINDI: SUPER DETEKTIV ISHI!",
      verdict_false: "TIZIM BUZILDI: PUL O'ZLASHTIRILDI!",
      xp_gained: "Tajriba (XP) olindi",
      clues_analyzed: "Shubhali belgilar tahlili",
      tactics_exchanged: "Ruhiy manipulyatsiya usuli",
      clues_found: "Aniqlangan dalillar",
      clues_missed: "O'tkazib yuborilgan xatolar",
      play_again: "Yangi tergovni boshlash",
      go_home: "Bosh sahifaga",
      correct: "To'g'ri Verdict",
      incorrect: "Noto'g'ri Verdict"
    }
  }
};

export const MINI_GAME_SCENARIOS: import('./types').MiniGameScenario[] = [
  {
    id: "mg-1",
    title: "The Urgent CEO Request",
    category: "Phishing & Pretexting",
    situation: "You receive a message on Telegram from an account claiming to be your CEO, Farrukh. It has his profile picture. 'I am stuck in a confidential meeting. I need you to immediately buy 5 Apple Gift Cards ($100 each) for our foreign clients and send me the codes. I will reimburse you by the end of the day.'",
    question: "What is your immediate response?",
    timeLimit: 15,
    hint: "Executives never use personal gift cards for corporate expenses, and attackers often exploit the 'Authority' principle to rush you.",
    choices: [
      { text: "Comply immediately to impress the boss.", isCorrect: false, awarenessReward: 0, resilienceReward: -5 },
      { text: "Call Farrukh directly on his known number to verify.", isCorrect: true, awarenessReward: 10, resilienceReward: 15 },
      { text: "Ask the Telegram account for proof of identity.", isCorrect: false, awarenessReward: 5, resilienceReward: 0 },
      { text: "Ignore it, but don't report it.", isCorrect: false, awarenessReward: 2, resilienceReward: 5 }
    ]
  },
  {
    id: "mg-2",
    title: "Free Security Audit",
    category: "Baiting",
    situation: "A well-dressed individual walks into your office lobby offering 'Free USB Security Audits' for staff. They hand you a branded USB flash drive and say, 'Just plug this into your laptop, and it will scan your local files for malware completely free.'",
    question: "What should you do?",
    timeLimit: 10,
    hint: "Physical media is a common vector for deploying ransomware or keyloggers.",
    choices: [
      { text: "Plug it into a secure, isolated sandbox computer.", isCorrect: false, awarenessReward: 5, resilienceReward: 5 },
      { text: "Politely decline and immediately notify building security.", isCorrect: true, awarenessReward: 15, resilienceReward: 10 },
      { text: "Plug it into your work laptop. It's free security!", isCorrect: false, awarenessReward: 0, resilienceReward: -10 }
    ]
  },
  {
    id: "mg-3",
    title: "IT Support Call",
    category: "Quid Pro Quo",
    situation: "Your phone rings. 'Hi, this is Tech Support. We are fixing the slow internet issue reported on your floor. We just need you to install this remote viewing tool so we can update your drivers.'",
    question: "How do you handle this?",
    timeLimit: 12,
    hint: "Never install remote software from unsolicited callers, even if they know your floor.",
    choices: [
      { text: "Install the software to get faster internet.", isCorrect: false, awarenessReward: 0, resilienceReward: 0 },
      { text: "Ask for their employee ID and verify it internally.", isCorrect: false, awarenessReward: 10, resilienceReward: 5 },
      { text: "Hang up and call the official IT Helpdesk extension to confirm.", isCorrect: true, awarenessReward: 15, resilienceReward: 15 }
    ]
  }
];
