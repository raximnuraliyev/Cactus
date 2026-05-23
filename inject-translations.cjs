const fs = require('fs');
const path = require('path');

const locales = ['en', 'ru', 'uz'];
const translations = {
  en: {
    dashboard: {
      scanner: {
        title: "NEURAL THREAT DIAGNOSTIC",
        status_sweeping: "SWEEPING...",
        status_calibrated: "CALIBRATED",
        btn_scanning: "SCANNING",
        btn_trigger: "TRIGGER CORE SCAN",
        traffic: "TRAFFIC:",
        sweeping: "SWEEPING",
        traffic_normal: "NORMAL",
        traffic_elevated: "ELEVATED",
        traffic_low: "LOW",
        delay_stat: "DELAY STAT:",
        sec: "SEC",
        core_delay: "Core Delay"
      }
    },
    briefing: {
      case_archive_id: "CASE ARCHIVE ID:",
      difficulty_easy: "EASY",
      difficulty_medium: "MEDIUM",
      difficulty_hard: "HARD",
      multiplier: "MULTIPLIER",
      tactical_metric: "TACTICAL METRIC",
      metric: {
        phone_call: "AUDIO DEEPFAKE",
        phishing: "PHISHING MAIL",
        transaction: "PAYMENT SECURE",
        document: "DOC VERIFY"
      },
      official_target: "OFFICIAL TARGET",
      xp_prospect: "XP PROSPECT",
      rule_1: "Probe the target using dialogue queries. Check if accounts, credentials, and names pass banking authenticity.",
      rule_2: "Deploy interactive investigation tools (e.g., Hang Up and dial helpline) to diagnose potential bypass attempts.",
      rule_3: "Flag dialogue turns containing high-pressure manipulation clues to secure evidence bonuses."
    },
    scenarios: {
      "phone-call-1": {
        title: "Central Bank Urgent Verification",
        character_intro: "Alex Mercer from Security Operations Division",
        briefing: "You receive an incoming call from a Tashkent number (+998 71 200-XX-XX). The caller introduces himself as Alex Mercer, Senior Officer from the Cyber-Security division of your main bank.",
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
      "phishing-email-1": {
        title: "System Authentication Failure Alert",
        character_intro: "IT System Administrator (admin@secure-logon-notification.com)",
        briefing: "You receive an urgent flag in your inbox. Topic: '[CRITICAL SECURITY ACTION REQUIRED] Account Deactivation'. The email looks highly professional, wearing your company's full security headers and official logos, urging a password change.",
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
      "transaction-1": {
        title: "Mysterious Cashback Refund Redirect",
        character_intro: "Refund Operations Desk",
        briefing: "An SMS arrives: 'CONGRATULATIONS! You received a cashback reward of 450,000 UZS. Click to claim your payout instantly: pay-cashback-tashkent.uz/claim'. The portal asks you to choose your bank and type your card billing parameters.",
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
      "document-1": {
        title: "Corporate Audit Official Mandate",
        character_intro: "Executive Inspector Tarasova",
        briefing: "Your agency receives an email with an encrypted PDF attachment. Topic: 'Notice of Special Taxation Offsets audit'. The document carries official government signatures, stamps, and is watermarked strictly secret. It demands you to download an executable decryption tool to open the balance ledger.",
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
    },
    tournaments: {
      title: "Multiplayer Ops",
      subtitle: "Train together. Trust no one.",
      info_header_title: "Squad Management",
      info_header_desc: "Join an existing operation with a code, or host your own secure lobby for up to 4 operatives.",
      join_squad: "Join Squad",
      create_squad: "Create Squad",
      enter_code: "Enter Lobby Code",
      join_btn: "JOIN",
      invalid_code: "Invalid or full lobby.",
      or: "OR",
      scan_qr: "Scan Operative QR",
      tap_camera: "Tap to open camera",
      host_op: "Host an Operation",
      host_desc: "Create a secure lobby and invite up to 3 other operatives. You will compete on the same cases simultaneously.",
      game_mode: "Game Mode",
      standard_ops: "Standard Ops",
      difficulty: "Difficulty",
      adaptive: "Adaptive",
      max_squad: "Max Squad Size",
      operatives_count: "Operatives",
      create_lobby: "Create Lobby",
      global_ops: "Global Operations",
      info_global_title: "Global Tournaments",
      info_global_desc: "Compete in massive scheduled events against hundreds of players for exclusive badges and high XP payouts.",
      no_global: "No global tournaments active currently.",
      check_back: "Check back later or start your own squad.",
      waiting_operatives: "Waiting for Operatives...",
      share_code: "Share this code or QR with your squad",
      lobby_code: "Lobby Code",
      ready: "Ready",
      scan_to_join: "SCAN TO JOIN",
      operatives: "Operatives",
      host: "Host",
      awaiting: "Awaiting connection...",
      simulate_join: "Simulate Player Join",
      commence_op: "Commence Operation",
      disband_squad: "Disband Squad",
      error: "Error creating lobby"
    },
    arena: {
      connection_lost: "CONNECTION LOST. NO ACTIVE LOBBY.",
      return: "Return",
      identity: "Your Hidden Identity",
      fraudster_obj: "Objective: Frame another player or escape undetected. Sabotage the investigation.",
      bank_obj: "Objective: Identify the fraudster and secure the transaction logs.",
      objectives: "Active Objectives",
      leaderboard: "Live Leaderboard",
      dashboard: "Personal Dashboard",
      dashboard_desc: "Track your objectives, view your secret role, and monitor leaderboard rankings based on XP.",
      scenario: "Operation: Phantom Invoice",
      time_remaining: "Time Remaining",
      active_target: "ACTIVE TARGET",
      hub: "Scenario Hub",
      hub_desc: "Observe player connections. Visual representation of active interrogations and game phases.",
      commlink: "Encrypted Comm-Link",
      commlink_desc: "Live chatbox for squad communication. Find inconsistencies in stories to expose the Fraudster!",
      transmit: "Transmit message...",
      propose_deal: "Propose Deal",
      finish: "FINISH",
      next: "NEXT",
      op_concluded: "Operation Concluded",
      victory: "Victory goes to the",
      post_game: "Post-Game Intel",
      fraudster_was: "The Fraudster was:",
      xp_earned: "Your Base XP Earned:",
      return_lobby: "Return to Lobby",
      abandon: "Abandon Operation?",
      abandon_warn: "WARNING: Abandoning an active tournament will result in an immediate ELO penalty and forfeit of all session XP.",
      return_game: "Return to Game",
      accept_penalty: "Accept Penalty"
    }
  },
  ru: {
    dashboard: {
      scanner: {
        title: "НЕЙРОЛАБОРАТОРИЯ УГРОЗ",
        status_sweeping: "СКАНИРОВАНИЕ...",
        status_calibrated: "КАЛИБРОВКА ЗАВЕРШЕНА",
        btn_scanning: "СКАНИРОВАНИЕ",
        btn_trigger: "ЗАПУСТИТЬ СКАН",
        traffic: "ТРАФИК:",
        sweeping: "СКАНИР.",
        traffic_normal: "НОРМА",
        traffic_elevated: "ПОВЫШЕН",
        traffic_low: "НИЗКИЙ",
        delay_stat: "ЗАДЕРЖКА:",
        sec: "СЕК",
        core_delay: "Задержка Ядра"
      }
    },
    briefing: {
      case_archive_id: "ID АРХИВА:",
      difficulty_easy: "ЛЕГКИЙ",
      difficulty_medium: "СРЕДНИЙ",
      difficulty_hard: "СЛОЖНЫЙ",
      multiplier: "МНОЖИТЕЛЬ",
      tactical_metric: "ТАКТИЧЕСКАЯ МЕТРИКА",
      metric: {
        phone_call: "АУДИО ДИПФЕЙК",
        phishing: "ФИШИНГОВОЕ ПИСЬМО",
        transaction: "БЕЗОПАСНЫЙ ПЛАТЕЖ",
        document: "ПРОВЕРКА ДОКУМЕНТОВ"
      },
      official_target: "ОФИЦИАЛЬНАЯ ЦЕЛЬ",
      xp_prospect: "ВОЗНАГРАЖДЕНИЕ XP",
      rule_1: "Допросите цель, используя вопросы из диалога. Проверьте банковские данные.",
      rule_2: "Применяйте интерактивные инструменты расследования (например, 'Повесить трубку').",
      rule_3: "Помечайте диалоги с манипуляциями для получения бонусов за улики."
    },
    scenarios: {
      "phone-call-1": {
        title: "Срочная проверка Центрального Банка",
        character_intro: "Алекс Мерсер из Отдела безопасности",
        briefing: "Вам поступает звонок с ташкентского номера (+998 71 200-XX-XX). Звонящий представляется Алексом Мерсером, старшим офицером отдела кибербезопасности вашего банка.",
        stages: [
          {
            question: "Здравствуйте, это офицер Алекс Мерсер. Мы зафиксировали попытку несанкционированного перевода 12 500 000 сум из Самарканда. Нам нужно срочно заблокировать операцию.",
            choices: [
              "Стойте, я не подтверждал такой перевод! Заблокируйте немедленно!",
              "Можете ли вы отправить официальное уведомление в мое банковское приложение?",
              "Вы звоните с официального номера банка? У меня на экране обычный мобильный."
            ],
            responses: {
              isReal: "Да, мы временно заблокировали операцию. Я отправлю запрос в ваше банковское приложение. Пожалуйста, подтвердите его в разделе Безопасность.",
              isFake: "Система заблокирована из-за атаки! Я не могу отправлять обычные уведомления. Я отправил SMS-код на ваш номер для обхода блокировки. Продиктуйте цифры прямо сейчас, иначе ваши деньги пропадут!"
            }
          },
          {
            question: "Мы инициировали безопасный перевод ваших оставшихся средств на счет государственного страхового хранилища #A99-31. Для авторизации нам нужна верификация.",
            choices: [
              "Давайте я повешу трубку и позвоню в вашу официальную службу поддержки для подтверждения.",
              "Я введу код из SMS на экране, но не буду вам его диктовать.",
              "Назовите ваш официальный идентификационный код сотрудника."
            ],
            responses: {
              isReal: "Конечно. Мой ID - Sec-Auth-9428. Вы можете повесить трубку, позвонить по номеру на вашей карте и попросить соединить с добавочным 9428. Будьте осторожны.",
              isFake: "Сброс звонка обнулит время блокировки! Если вы повесите трубку, система сочтет вас виновным, и страховка не покроет потери! Вы обязаны продиктовать мне код или подтвердить перевод немедленно!"
            }
          },
          {
            question: "Транзитный счет временный. Мы завершаем настройку безопасного коридора. Продиктуйте код или подтвердите ваши данные.",
            choices: [
              "Это похоже на мошенничество. Я вешаю трубку.",
              "Могу ли я сначала поговорить с вашим начальником или руководителем отдела?",
              "Откуда у вас мои данные без стандартной банковской проверки?"
            ],
            responses: {
              isReal: "Я полностью понимаю вашу осторожность. Позвольте немедленно перевести вас на моего руководителя отдела кибербезопасности, Елену Вэнс. Минуточку.",
              isFake: "У нас нет времени ждать руководителя! Каждую секунду, пока вы спорите, ваш баланс переводится на офшорные карты! Я приказываю вам продиктовать код немедленно!"
            }
          }
        ]
      },
      "phishing-email-1": {
        title: "Оповещение об ошибке аутентификации системы",
        character_intro: "Системный ИТ-администратор (admin@secure-logon-notification.com)",
        briefing: "Вы получаете срочное письмо на почту. Тема: '[КРИТИЧЕСКОЕ ДЕЙСТВИЕ] Деактивация аккаунта'. Письмо выглядит очень профессионально, с логотипами вашей компании и требует смены пароля.",
        stages: [
          {
            question: "Предупреждение аудита: Обнаружен необычный вход в систему из Пекина. Если это были не вы, перейдите по ссылке, чтобы подтвердить ID вашего аппаратного ключа в течение 60 минут.",
            choices: [
              "Сначала проверить точный адрес ссылки.",
              "Следовать инструкциям для защиты корпоративного портала.",
              "Ответить на письмо с запросом подтверждения моих операций в Пекине."
            ],
            responses: {
              isReal: "Для входа на портал требуется ваш аппаратный аутентификатор. Зашифрованный запрос отправляется на ваш физический токен. Ссылка открывает официальный SSO-портал компании.",
              isFake: "При наведении на URL видно, что ссылка ведет на 'https://secured-session-id-9912.ru/auth/login', скрытую под текстом 'Официальный SSO портал'. На странице тикает таймер обратного отсчета."
            }
          },
          {
            question: "Уведомление: Отказ от мгновенной проверки личности приведет к автоматической блокировке аккаунта, а отдел кадров будет уведомлен о нарушении политики безопасности.",
            choices: [
              "Запросить проверку этого уведомления через официальную ИТ-поддержку в Slack.",
              "Направить это письмо напрямую на портал защиты от фишинга.",
              "Ввести учетные данные, чтобы избежать проблем с отделом кадров."
            ],
            responses: {
              isReal: "Верно. Наша служба ИТ-поддержки подтверждает, что разослала локальное уведомление о безопасности всем пользователям. В Slack есть официальный анонс.",
              isFake: "Стандартная ИТ-команда НИКОГДА бы не угрожала отстранением через отдел кадров из-за токена аутентификации! Этот домен был зарегистрирован всего 4 часа назад."
            }
          }
        ]
      },
      "transaction-1": {
        title: "Таинственный кэшбэк-возврат",
        character_intro: "Служба возврата платежей",
        briefing: "Приходит SMS: 'ПОЗДРАВЛЯЕМ! Вы получили кэшбэк в размере 450 000 сум. Нажмите, чтобы получить выплату мгновенно: pay-cashback-tashkent.uz/claim'. Портал просит выбрать банк и ввести данные карты.",
        stages: [
          {
            question: "Портал выплат: Пожалуйста, введите 16-значный номер карты, код CVV и текущий кредитный лимит, чтобы мы могли выбрать самый быстрый канал выплаты.",
            choices: [
              "Заполнить данные карты, но использовать фальшивый CVV и срок действия.",
              "Стоп. Для получения денег никогда не нужен CVV или срок действия.",
              "Ввести кредитные лимиты, чтобы открыть ускоренную выплату."
            ],
            responses: {
              isReal: "Официальные банки просят только номер телефона (переводы HumoPay/Uzcard) или номер карты. Запрашивать CVV строго запрещено.",
              isFake: "Форма выдает ошибку 'неверный CVV' и требует настоящие цифры, доказывая, что это фишинговый сборщик данных карты."
            }
          }
        ]
      },
      "document-1": {
        title: "Официальный мандат корпоративного аудита",
        character_intro: "Исполнительный инспектор Тарасова",
        briefing: "Ваше агентство получает письмо с зашифрованным PDF-вложением. Тема: 'Уведомление об аудите специальных налоговых зачетов'. Документ имеет официальные подписи, печати и гриф секретности. Он требует скачать инструмент расшифровки (.exe).",
        stages: [
          {
            question: "Документ содержит конфиденциальные налоговые записи 2026 года. Вы должны запустить 'tax-decryptor.exe' от имени администратора на вашей рабочей станции. Это обязательно по статье 114.",
            choices: [
              "Отказаться от запуска любого .exe. Запросить стандартные форматы CSV или PDF.",
              "Изучить цифровую подпись генератора '.exe'.",
              "Запустить расшифровщик в безопасной песочнице (VM)."
            ],
            responses: {
              isReal: "Департамент предоставляет безопасную ссылку с криптографическими подписями GPG, которые проверяются на сайте taxation.gov.uz.",
              isFake: "Запуск этой программы инициирует скрытый фоновый процесс, внедряющий кейлоггер и передающий ваши данные на удаленный сервер управления."
            }
          }
        ]
      }
    },
    tournaments: {
      title: "Многопользовательские Опер.",
      subtitle: "Тренируйтесь вместе. Никому не доверяйте.",
      info_header_title: "Управление Отрядом",
      info_header_desc: "Присоединитесь к существующей операции по коду или создайте собственное лобби до 4 оперативников.",
      join_squad: "Присоединиться",
      create_squad: "Создать Отряд",
      enter_code: "Введите Код Лобби",
      join_btn: "ВОЙТИ",
      invalid_code: "Неверный код или лобби заполнено.",
      or: "ИЛИ",
      scan_qr: "Сканировать QR-код",
      tap_camera: "Нажмите, чтобы открыть камеру",
      host_op: "Организовать Операцию",
      host_desc: "Создайте безопасное лобби и пригласите до 3 оперативников. Вы будете соревноваться одновременно.",
      game_mode: "Режим Игры",
      standard_ops: "Стандартные Операции",
      difficulty: "Сложность",
      adaptive: "Адаптивная",
      max_squad: "Размер Отряда",
      operatives_count: "Оперативника",
      create_lobby: "Создать Лобби",
      global_ops: "Глобальные Операции",
      info_global_title: "Глобальные Турниры",
      info_global_desc: "Соревнуйтесь в масштабных турнирах с сотнями игроков за эксклюзивные значки и высокий XP.",
      no_global: "В данный момент нет активных глобальных турниров.",
      check_back: "Зайдите позже или создайте свой отряд.",
      waiting_operatives: "Ожидание Оперативников...",
      share_code: "Поделитесь кодом или QR с отрядом",
      lobby_code: "Код Лобби",
      ready: "Готово",
      scan_to_join: "СКАНИРОВАТЬ ДЛЯ ВХОДА",
      operatives: "Оперативники",
      host: "Хост",
      awaiting: "Ожидание подключения...",
      simulate_join: "Симулировать Подключение",
      commence_op: "Начать Операцию",
      disband_squad: "Распустить Отряд",
      error: "Ошибка создания лобби"
    },
    arena: {
      connection_lost: "ПОТЕРЯНО СОЕДИНЕНИЕ. НЕТ АКТИВНОГО ЛОББИ.",
      return: "Вернуться",
      identity: "Ваша Секретная Роль",
      fraudster_obj: "Цель: Подставить другого игрока или уйти незамеченным. Саботировать расследование.",
      bank_obj: "Цель: Выявить мошенника и защитить журналы транзакций.",
      objectives: "Активные Задачи",
      leaderboard: "Живая Таблица Лидеров",
      dashboard: "Личная Панель",
      dashboard_desc: "Отслеживайте задачи, свою роль и следите за рейтингом лидеров.",
      scenario: "Операция: Призрачный Счёт",
      time_remaining: "Осталось времени",
      active_target: "АКТИВНАЯ ЦЕЛЬ",
      hub: "Сценарный Хаб",
      hub_desc: "Следите за связями игроков. Визуальное представление допросов и фаз игры.",
      commlink: "Зашифрованный Канал",
      commlink_desc: "Живой чат для общения отряда. Ищите нестыковки в рассказах, чтобы раскрыть Мошенника!",
      transmit: "Передача сообщения...",
      propose_deal: "Предложить Сделку",
      finish: "ЗАВЕРШИТЬ",
      next: "ДАЛЕЕ",
      op_concluded: "Операция Завершена",
      victory: "Победу одержал",
      post_game: "Постигровые Данные",
      fraudster_was: "Мошенником был:",
      xp_earned: "Заработано Базового XP:",
      return_lobby: "Вернуться в Лобби",
      abandon: "Покинуть Операцию?",
      abandon_warn: "ВНИМАНИЕ: Уход из активного турнира приведет к немедленному штрафу ELO и потере всех XP сессии.",
      return_game: "Вернуться в Игру",
      accept_penalty: "Принять Штраф"
    }
  },
  uz: {
    dashboard: {
      scanner: {
        title: "NEYROTAHDID LABORATORIYASI",
        status_sweeping: "SKANERLANMOQDA...",
        status_calibrated: "KALIBRLANGAN",
        btn_scanning: "SKANER",
        btn_trigger: "SKANERLASHNI BOSHLASH",
        traffic: "TRAFIK:",
        sweeping: "SKANER",
        traffic_normal: "NORMAL",
        traffic_elevated: "YUQORI",
        traffic_low: "PAST",
        delay_stat: "KECHIKISH:",
        sec: "SEK",
        core_delay: "Yadro kechikishi"
      }
    },
    briefing: {
      case_archive_id: "ARXIV ID:",
      difficulty_easy: "OSON",
      difficulty_medium: "O'RTACHA",
      difficulty_hard: "QIYIN",
      multiplier: "MULTIPLIER",
      tactical_metric: "TAKTIK METRIKA",
      metric: {
        phone_call: "AUDIO DEEPFAKE",
        phishing: "FISHING E-POCHTA",
        transaction: "KARTA TO'LOVI",
        document: "HUJJAT TEKSHIRUVI"
      },
      official_target: "RASMIY NISHON",
      xp_prospect: "XP KUTILMASI",
      rule_1: "Suhbatdoshni savollar orqali sinovdan o'tkazing. Bank xavfsizligiga mosligini tekshiring.",
      rule_2: "Diagnostika vositalaridan (masalan, go'shakni qo'yish) foydalaning.",
      rule_3: "Qo'shimcha bonus olish uchun manipulyatsiya belgilariga ega suhbatlarni belgilang."
    },
    scenarios: {
      "phone-call-1": {
        title: "Markaziy Bank Shoshilinch Tekshiruvi",
        character_intro: "Xavfsizlik Bo'limidan Aleks Merser",
        briefing: "Sizga Toshkent raqamidan (+998 71 200-XX-XX) qo'ng'iroq keladi. Qo'ng'iroq qiluvchi o'zini Aleks Merser, bankingizning Kiberxavfsizlik bo'limi bosh ofitseri deb tanishtiradi.",
        stages: [
          {
            question: "Salom, men ofitser Aleks Merserman. Biz sizning hisobingizdan Samarqanddan 12 500 000 so'm miqdorida ruxsatsiz o'tkazmani aniqladik. Biz uni bloklash uchun zudlik bilan harakat qilishimiz kerak.",
            choices: [
              "To'xtang, men bunday o'tkazmaga ruxsat bermaganman! Uni darhol bloklang!",
              "Bank ilovamga rasmiy tasdiqlash xabari yoki bildirishnoma yubora olasizmi?",
              "Siz rasmiy bank raqamidan qo'ng'iroq qilyapsizmi? Ekranda oddiy mobil raqam ko'rsatilgan."
            ],
            responses: {
              isReal: "Ha, biz urinishni vaqtincha blokladik. Men tekshirish uchun bank ilovangizga rasmiy ruxsat so'rovini yuboraman. Iltimos, uni to'g'ridan-to'g'ri Xavfsizlik sozlamalarida tasdiqlang.",
              isFake: "Xakerlik hujumi tufayli tizim bloklangan! Men odatiy bildirishnomalarni yubora olmayman. Xavfsizlik blokini ochish uchun raqamingizga SMS OTP kod yubordim. Menga raqamlarni hoziroq ayting, aks holda pullaringiz ketadi!"
            }
          },
          {
            question: "Biz qolgan mablag'ingizni davlat tomonidan nazorat qilinadigan #A99-31 sug'urta omboriga o'tkazish uchun xavfsiz o'tkazmani boshladik. Avtorizatsiya qilish uchun bizga tasdiqlash kerak.",
            choices: [
              "Keling, men go'shakni qo'yaman va tasdiqlash uchun mijozlarni qo'llab-quvvatlash rasmiy raqamiga qo'ng'iroq qilaman.",
              "Men SMS kodini ekranimga kiritaman, lekin uni sizga o'qib bermayman.",
              "Sizning rasmiy xodim identifikatsiya kodingiz qanday?"
            ],
            responses: {
              isReal: "Albatta. Mening ID kodim Sec-Auth-9428. Go'shakni qo'yishingiz, kartangizdagi bank raqamiga qo'ng'iroq qilishingiz va to'g'ridan-to'g'ri 9428 ichki raqamini so'rashingiz mumkin. Xavfsiz bo'ling.",
              isFake: "Go'shakni qo'yish endi blokirovka vaqtini tiklaydi! Agar go'shakni qo'ysangiz, tizim sizni beparvo deb hisoblaydi va sug'urta yo'qotishlaringizni qoplamaydi! Siz menga kodni o'qib berishingiz yoki ushbu ombor o'tkazmasini darhol tasdiqlashingiz kerak!"
            }
          },
          {
            question: "Tranzit ombori vaqtinchalik. Biz xavfsiz koridorni yakunlayapmiz. Menga kodni bering yoki xavfsizlik ma'lumotlaringizni tasdiqlang.",
            choices: [
              "Bu firibgarlikka o'xshaydi. Men go'shakni qo'yyapman.",
              "Avval sizning rahbaringiz yoki bo'lim boshlig'ingiz bilan gaplashsam bo'ladimi?",
              "Mening ma'lumotlarimni standart bank tekshiruvisiz qanday oldingiz?"
            ],
            responses: {
              isReal: "Men sizning ehtiyotkorligingizni to'liq tushunaman. Keling, sizni darhol kiber bo'lim rahbarim Elena Vensga ulayman. Bir soniya.",
              isFake: "Rahbarni navbatda kutishga vaqt yo'q! Siz bahslashayotgan har bir soniyada balans ofshor kartalarga o'tkazilmoqda! Men sizga kodni hoziroq aytishingizni buyuraman!"
            }
          }
        ]
      },
      "phishing-email-1": {
        title: "Tizim Autentifikatsiyasi Xatosi Haqida Ogohlantirish",
        character_intro: "IT Tizim Administratori (admin@secure-logon-notification.com)",
        briefing: "Pochtanggizga shoshilinch xabar keldi. Mavzu: '[MUHIM XAVFSIZLIK HARAKATI TALAB QILINADI] Akkauntni o'chirish'. Xat sizning kompaniyangiz logotiplari bilan juda professional ko'rinadi va parolni o'zgartirishga chaqiradi.",
        stages: [
          {
            question: "Xavfsizlik Auditi Ogohlantirishi: Pekindagi noma'lum mijozdan g'ayrioddiy kirish aniqlandi. Agar bu siz bo'lmasangiz, 60 daqiqa ichida apparat kaliti ID ni tasdiqlash uchun havolani bosing.",
            choices: [
              "Avval havolaning aniq manzilini tekshirish.",
              "Korporativ portalimni xavfsiz qilish uchun ko'rsatmalarga amal qilish.",
              "Pekindagi operatsiyalarimni tasdiqlashni so'rab xatga javob berish."
            ],
            responses: {
              isReal: "Portal xavfsiz apparat autentifikatoringizni talab qiladi. Jismoniy tokeningizga shifrlangan so'rov yuboriladi. Bossangiz, domein muhrlari bilan rasmiy SSO ochiladi.",
              isFake: "URL manziliga kursorni olib borganda, maqsadli manzil 'Ochiq SSO Portali' vizual matni orqasida yashiringan 'https://secured-session-id-9912.ru/auth/login' ekanligi ma'lum bo'ladi. Qabul qilish sahifasida shoshilinch muddat taymeri aylanmoqda."
            }
          },
          {
            question: "Eslatma: Shaxsni zudlik bilan tasdiqlamaslik akkauntning avtomatik bloklanishiga olib keladi va mahalliy HR xavfsizlik siyosati buzilishi haqida xabardor qilinadi.",
            choices: [
              "Slack orqali rasmiy IT yordam xizmati orqali ushbu eslatmani tasdiqlashni so'rash.",
              "Ushbu xatni to'g'ridan-to'g'ri fishingga qarshi portalga yuborish.",
              "HR asoratlarini oldini olish uchun ma'lumotlarni kiritish."
            ],
            responses: {
              isReal: "To'g'ri. Bizning IT yordam xizmati barcha foydalanuvchilarga mahalliy xavfsizlik xabarini yuborganligini tasdiqlaydi. Ichki Slack kanali xavfsiz e'lonni ko'rsatadi.",
              isFake: "Standart IT jamoasi HECH QACHON autentifikatsiya tokeni uchun HR ni jalb qilish bilan tahdid qilmaydi! Ushbu domen atigi 4 soat oldin chet el yurisdiksiyasida ro'yxatdan o'tgan."
            }
          }
        ]
      },
      "transaction-1": {
        title: "Sirli Cashback Qaytarilishi",
        character_intro: "To'lovni Qaytarish Xizmati",
        briefing: "SMS keldi: 'TABRIKLAYMIZ! Siz 450,000 UZS miqdorida keshbek oldingiz. To'lovni zudlik bilan olish uchun bosing: pay-cashback-tashkent.uz/claim'. Portal sizning bankingizni tanlashingizni va karta ma'lumotlarini kiritishingizni so'raydi.",
        stages: [
          {
            question: "To'lov Portali: Eng tezkor to'lov kanalini tanlashimiz uchun iltimos, 16 xonali karta raqamingiz, CVV kodingiz va joriy kredit limitini kiriting.",
            choices: [
              "Karta ma'lumotlarini to'ldiring, lekin soxta CVV va amal qilish muddatidan foydalaning.",
              "To'xtang. Pul olish uchun hech qachon CVV yoki amal qilish muddati kerak emas.",
              "Tezroq to'lov tezligini ochish uchun kredit limitlarini kiriting."
            ],
            responses: {
              isReal: "Rasmiy banklar faqat ro'yxatdan o'tgan telefon raqamingizga (HumoPay/Uzcard) yoki karta raqamiga pul o'tkazishni so'raydi. CVV hech qachon so'ralmaydi.",
              isFake: "Shakl tekshiruvchisi CVV 'noto'g'ri' ekanligini ta'kidlaydi va davom etishdan oldin haqiqiy raqamlarni talab qiladi. Bu sizning kartangiz ma'lumotlarini o'g'irlashga urinayotgan firibgarlik ekanligini isbotlaydi."
            }
          }
        ]
      },
      "document-1": {
        title: "Korporativ Audit Rasmiy Mandati",
        character_intro: "Ijroiya Inspektori Tarasova",
        briefing: "Agentligingiz shifrlangan PDF ilovasi bilan elektron pochta oladi. Mavzu: 'Maxsus soliq imtiyozlari auditi to'g'risida bildirishnoma'. Hujjatda rasmiy davlat imzolari, muhrlari mavjud va u qat'iy maxfiy deb belgilangan. U sizdan balans daftarini ochish uchun .exe dasturini yuklab olishingizni talab qiladi.",
        stages: [
          {
            question: "Hujjatda 2026 yilgi maxfiy soliq yozuvlari mavjud. Fayllarni shifrdan chiqarish uchun ish stantsiyangizda admin sifatida 'tax-decryptor.exe' ni ishga tushirishingiz kerak. Bu 114-moddaga muvofiq majburiydir.",
            choices: [
              "Hech qanday dasturni ishga tushirishdan bosh torting. Standart CSV yoki PDF formatlarini so'rang.",
              "'.exe' fayl generatorining raqamli imzosini tekshiring.",
              "Shifrdan chiqaruvchini xavfsiz virtual mashinada ishga tushiring."
            ],
            responses: {
              isReal: "Departament taxation.gov.uz da ro'yxatga olingan standart GPG shifrlangan imzolarga ega xavfsiz yuklab olish havolasini taqdim etadi.",
              isFake: "Ushbu dasturni ishga tushirish yashirin fon jarayonini boshlaydi, bu tizimga klaviaturani kuzatuvchi virus o'rnatishga va foydalanuvchi ma'lumotlarini uzoq serverga o'tkazishga urinadi."
            }
          }
        ]
      }
    },
    tournaments: {
      title: "Ko'p o'yinchili Operatsiyalar",
      subtitle: "Birga mashq qiling. Hech kimga ishonmang.",
      info_header_title: "Otryadni Boshqarish",
      info_header_desc: "Kod orqali mavjud operatsiyaga qo'shiling yoki 4 tagacha o'yinchi uchun xavfsiz lobi yarating.",
      join_squad: "Otryadga Qo'shilish",
      create_squad: "Otryad Yaratish",
      enter_code: "Lobbi Kodini Kiriting",
      join_btn: "QO'SHILISH",
      invalid_code: "Kod noto'g'ri yoki lobbi to'la.",
      or: "YOKI",
      scan_qr: "QR Kodni Skanerlash",
      tap_camera: "Kamerani ochish uchun bosing",
      host_op: "Operatsiya Yaratish",
      host_desc: "Xavfsiz lobi yarating va 3 tagacha o'yinchini taklif qiling. Siz bir vaqtda musobaqalashasiz.",
      game_mode: "O'yin Rejimi",
      standard_ops: "Standart Operatsiyalar",
      difficulty: "Qiyinlik",
      adaptive: "Moslashuvchan",
      max_squad: "Maksimal Otryad",
      operatives_count: "Operativlar",
      create_lobby: "Lobbi Yaratish",
      global_ops: "Global Operatsiyalar",
      info_global_title: "Global Turnirlar",
      info_global_desc: "Eksklyuziv nishonlar va yuqori XP uchun yuzlab o'yinchilar bilan yirik turnirlarda qatnashing.",
      no_global: "Hozirda faol global turnirlar yo'q.",
      check_back: "Keyinroq tekshiring yoki o'zingizning otryadingizni yarating.",
      waiting_operatives: "Operativlar Kutilmoqda...",
      share_code: "Ushbu kodni yoki QRni ulashing",
      lobby_code: "Lobbi Kodi",
      ready: "Tayyor",
      scan_to_join: "QO'SHILISH UCHUN SKANERLANG",
      operatives: "Operativlar",
      host: "Xost",
      awaiting: "Ulanish kutilmoqda...",
      simulate_join: "O'yinchini Simulyatsiya Qilish",
      commence_op: "Operatsiyani Boshlash",
      disband_squad: "Otryadni Tarqatish",
      error: "Lobbi yaratishda xato"
    },
    arena: {
      connection_lost: "ALOQA UZILDI. FAOL LOBBI YO'Q.",
      return: "Qaytish",
      identity: "Sizning Yashirin Rolingiz",
      fraudster_obj: "Maqsad: Boshqa o'yinchini ayblash yoki bildirmay qochish. Tergovni sabotaj qiling.",
      bank_obj: "Maqsad: Firibgarni aniqlash va tranzaksiya jurnallarini himoya qilish.",
      objectives: "Faol Vazifalar",
      leaderboard: "Jonli Liderlar Doskasi",
      dashboard: "Shaxsiy Panel",
      dashboard_desc: "Vazifalaringizni, rolingizni va liderlar reytingini kuzatib boring.",
      scenario: "Operatsiya: Arvoh Hisob-faktura",
      time_remaining: "Qolgan Vaqt",
      active_target: "FAOL NISHON",
      hub: "Ssenariy Xabi",
      hub_desc: "O'yinchilar aloqalarini kuzating. Tergovlar va o'yin bosqichlarining vizual ko'rinishi.",
      commlink: "Shifrlangan Aloqa",
      commlink_desc: "Otryad muloqoti uchun jonli chat. Firibgarni fosh qilish uchun yolg'onlarni toping!",
      transmit: "Xabar yuborish...",
      propose_deal: "Kelishuv Taklif Qilish",
      finish: "TUGATISH",
      next: "KEYINGISI",
      op_concluded: "Operatsiya Yakunlandi",
      victory: "G'alaba qozondi:",
      post_game: "O'yindan Keyingi Ma'lumotlar",
      fraudster_was: "Firibgar:",
      xp_earned: "Olingan Asosiy XP:",
      return_lobby: "Lobbiga Qaytish",
      abandon: "Operatsiyani Tark Etish?",
      abandon_warn: "OGOHLANTIRISH: Faol turnirni tark etish ELO jarimasiga va barcha XP yo'qotilishiga olib keladi.",
      return_game: "O'yinga Qaytish",
      accept_penalty: "Jarimani Qabul Qilish"
    }
  }
};

locales.forEach(loc => {
  const file = path.join(__dirname, 'src/i18n', `${loc}.json`);
  let content = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  content = {
    ...content,
    ...translations[loc]
  };
  
  fs.writeFileSync(file, JSON.stringify(content, null, 2));
});
console.log("Translations injected.");
