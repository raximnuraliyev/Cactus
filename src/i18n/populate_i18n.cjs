const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'en.json');
const ruPath = path.join(__dirname, 'ru.json');
const uzPath = path.join(__dirname, 'uz.json');

const updateJson = (filePath, lang) => {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  data.game_modal = {
    generating: lang === 'ru' ? "Генерация ИИ Сценария..." : lang === 'uz' ? "AI ssenariysi yaratilmoqda..." : "Generating AI Scenario...",
    conn_failed: lang === 'ru' ? "Ошибка Подключения" : lang === 'uz' ? "Ulanish xatosi" : "Connection Failed",
    abort: lang === 'ru' ? "Прервать" : lang === 'uz' ? "Bekor qilish" : "Abort",
    retry: lang === 'ru' ? "Повторить попытку" : lang === 'uz' ? "Qayta urinish" : "Retry Connection",
    briefing: lang === 'ru' ? "Инструктаж:" : lang === 'uz' ? "Ko'rsatma:" : "Briefing:",
    contact: lang === 'ru' ? "Контакт:" : lang === 'uz' ? "Aloqa:" : "Contact:",
    live_intercept: lang === 'ru' ? "Прямой Перехват" : lang === 'uz' ? "Jonli tutib olish" : "Live Interception",
    you: lang === 'ru' ? "Вы" : lang === 'uz' ? "Siz" : "You",
    unknown: lang === 'ru' ? "Неизвестный абонент" : lang === 'uz' ? "Noma'lum raqam" : "Unknown Caller",
    typing: lang === 'ru' ? "Печатает..." : lang === 'uz' ? "Yozmoqda..." : "Typing...",
    placeholder: lang === 'ru' ? "Введите ваш ответ..." : lang === 'uz' ? "Javobingizni kiriting..." : "Type your response to the caller...",
    correct_evasion: lang === 'ru' ? "Успешное Уклонение" : lang === 'uz' ? "Muvaffaqiyatli qochish" : "Correct Evasion",
    compromised: lang === 'ru' ? "Скомпрометировано" : lang === 'uz' ? "Murosaga kelingan" : "Compromised",
    success_msg: lang === 'ru' ? "Вы успешно избежали угрозы." : lang === 'uz' ? "Siz xavfni muvaffaqiyatli bartaraf etdingiz." : "You successfully navigated the threat.",
    fail_msg: lang === 'ru' ? "Вы поддались на тактику социальной инженерии." : lang === 'uz' ? "Siz ijtimoiy muhandislik taktikasiga aldanib qoldingiz." : "You fell for the social engineering tactic.",
    awareness: lang === 'ru' ? "Внимательность" : lang === 'uz' ? "Ogohlik" : "Awareness",
    intuition: lang === 'ru' ? "Интуиция" : lang === 'uz' ? "Intuitsiya" : "Intuition",
    speed: lang === 'ru' ? "Скорость" : lang === 'uz' ? "Tezlik" : "Speed",
    resilience: lang === 'ru' ? "Стойкость" : lang === 'uz' ? "Matonat" : "Resilience",
    next: lang === 'ru' ? "Загрузить Следующий Сценарий" : lang === 'uz' ? "Keyingi ssenariyni yuklash" : "Load Next Scenario"
  };

  data.voice_sim = {
    title: lang === 'ru' ? "Голосовой Симулятор ИИ" : lang === 'uz' ? "Ovozli AI simulyatori" : "Voice AI Simulator",
    subtitle: lang === 'ru' ? "Поговорите с голосовым мошенником на базе ИИ в реальном времени." : lang === 'uz' ? "Haqiqiy vaqtda AI asosidagi ovozli firibgar bilan gaplashing." : "Talk to an AI voice fraudster in real-time.",
    calling: lang === 'ru' ? "ЗВОНОК" : lang === 'uz' ? "QO'NG'IROQ" : "CALLING",
    ready: lang === 'ru' ? "СИСТЕМА ГОТОВА" : lang === 'uz' ? "TIZIM TAYYOR" : "SYSTEM READY",
    disconnecting: lang === 'ru' ? "ОТКЛЮЧЕНИЕ..." : lang === 'uz' ? "UZILMOQDA..." : "DISCONNECTING...",
    active_call: lang === 'ru' ? "АКТИВНЫЙ ВЫЗОВ" : lang === 'uz' ? "FAOL QO'NG'IROQ" : "ACTIVE CALL",
    time_elapsed: lang === 'ru' ? "Время:" : lang === 'uz' ? "Vaqt:" : "Time Elapsed:",
    start_call: lang === 'ru' ? "НАЧАТЬ СИМУЛЯЦИЮ" : lang === 'uz' ? "SIMULYATSIYANI BOSHLASH" : "START SIMULATION",
    end_call: lang === 'ru' ? "ЗАВЕРШИТЬ ВЫЗОВ" : lang === 'uz' ? "QO'NG'IROQNI YAKUNLASH" : "END CALL",
    status_idle: lang === 'ru' ? "Ожидание." : lang === 'uz' ? "Kutish." : "Standing by.",
    status_listening: lang === 'ru' ? "Слушаю вас..." : lang === 'uz' ? "Sizni eshityapman..." : "Listening to you...",
    status_thinking: lang === 'ru' ? "Обдумываю ответ..." : lang === 'uz' ? "Javob o'ylanmoqda..." : "Thinking about response...",
    status_speaking: lang === 'ru' ? "Говорю..." : lang === 'uz' ? "Gapiryapti..." : "Speaking...",
    warning: lang === 'ru' ? "Вы должны предоставить доступ к микрофону, чтобы использовать эту функцию." : lang === 'uz' ? "Ushbu xususiyatdan foydalanish uchun mikrofonga ruxsat berishingiz kerak." : "You must grant microphone access to use this feature.",
    go_back: lang === 'ru' ? "Назад на Панель" : lang === 'uz' ? "Boshqaruv paneliga qaytish" : "Back to Dashboard"
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

updateJson(enPath, 'en');
updateJson(ruPath, 'ru');
updateJson(uzPath, 'uz');
console.log("Translations added.");
