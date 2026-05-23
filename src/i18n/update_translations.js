const fs = require('fs');
const path = require('path');

const enPath = path.join('d:', 'real-or-fake_', 'src', 'i18n', 'en.json');
const ruPath = path.join('d:', 'real-or-fake_', 'src', 'i18n', 'ru.json');
const uzPath = path.join('d:', 'real-or-fake_', 'src', 'i18n', 'uz.json');

const updateJson = (filePath, lang) => {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Main menu
  if (data.main_menu) {
    data.main_menu.tournaments = lang === 'ru' ? "Турниры" : lang === 'uz' ? "Turnirlar" : "Tournaments";
    if (!data.main_menu.achievements) {
        data.main_menu.achievements = lang === 'ru' ? "Достижения" : lang === 'uz' ? "Yutuqlar" : "Achievements";
    }
  }

  // Profile data management
  if (data.profile) {
    Object.assign(data.profile, {
      data_management: lang === 'ru' ? "Управление данными" : lang === 'uz' ? "Ma'lumotlarni boshqarish" : "Data Management",
      export_data: lang === 'ru' ? "Экспорт данных" : lang === 'uz' ? "Ma'lumotlarni eksport qilish" : "Export Data",
      import_data: lang === 'ru' ? "Импорт данных" : lang === 'uz' ? "Ma'lumotlarni import qilish" : "Import Data",
      clear_cache: lang === 'ru' ? "Очистить кэш" : lang === 'uz' ? "Keshni tozalash" : "Clear Cache",
      import_success: lang === 'ru' ? "Профиль успешно импортирован!" : lang === 'uz' ? "Profil muvaffaqiyatli import qilindi!" : "Profile imported successfully!",
      import_error: lang === 'ru' ? "Неверные данные профиля." : lang === 'uz' ? "Noto'g'ri profil ma'lumotlari." : "Invalid profile data."
    });
  }

  // Placement
  data.placement = {
    cognitive_calibration: lang === 'ru' ? "Когнитивная калибровка" : lang === 'uz' ? "Kognitiv kalibrlash" : "Cognitive Calibration",
    calibration_desc: lang === 'ru' ? "Перед тем, как мы назначим ваши первые дела, нам нужно откалибровать вашу нейронную базу." : lang === 'uz' ? "Sizga birinchi ishlarni tayinlashdan oldin, biz asab bazasini kalibrlashimiz kerak." : "Before we assign your first cases, we need to calibrate your neural baseline.",
    q1: lang === 'ru' ? "1. Насколько вы знакомы с тактиками цифрового мошенничества?" : lang === 'uz' ? "1. Raqamli firibgarlik taktikalari bilan qanchalik tanishsiz?" : "1. How familiar are you with digital fraud tactics?",
    back: lang === 'ru' ? "Назад" : lang === 'uz' ? "Orqaga" : "Back",
    q2: lang === 'ru' ? "2. Как бы вы оценили свою ежедневную внимательность?" : lang === 'uz' ? "2. Kundalik e'tiboringizni qanday baholaysiz?" : "2. How would you rate your daily attentiveness?",
    initialize: lang === 'ru' ? "Инициализировать профиль" : lang === 'uz' ? "Profilni ishga tushirish" : "Initialize Profile",
    calibration_phase: lang === 'ru' ? "Фаза калибровки" : lang === 'uz' ? "Kalibrlash bosqichi" : "Calibration Phase",
    match: lang === 'ru' ? "Калибровочный матч" : lang === 'uz' ? "Kalibrlash o'yini" : "Placement Match",
    match_desc: lang === 'ru' ? "Ваши результаты в этих начальных делах определят ваш стартовый ранг и кривую сложности." : lang === 'uz' ? "Ushbu dastlabki ishlardagi natijalaringiz boshlang'ich darajangizni va qiyinchilik egri chizig'ini belgilaydi." : "Your performance in these initial cases will determine your starting rank and difficulty curve.",
    baseline_elo: lang === 'ru' ? "Текущий базовый ELO" : lang === 'uz' ? "Joriy asosiy ELO" : "Current Baseline ELO",
    match_difficulty: lang === 'ru' ? "Сложность матча" : lang === 'uz' ? "O'yin qiyinligi" : "Match Difficulty",
    progress: lang === 'ru' ? "Прогресс" : lang === 'uz' ? "Jarayon" : "Progress",
    commence: lang === 'ru' ? "Начать операцию" : lang === 'uz' ? "Operatsiyani boshlash" : "Commence Operation",
    directive: lang === 'ru' ? "Директива:" : lang === 'uz' ? "Direktiva:" : "Directive:",
    directive_desc: lang === 'ru' ? "Относитесь к этому делу серьезно. Ваша способность обнаруживать тонкие тактики манипулирования отслеживается. Ошибки существенно повлияют на ваш начальный рейтинг." : lang === 'uz' ? "Ushbu ishga jiddiy yondashing. Nozik manipulyatsiya taktikalarini aniqlash qobiliyatingiz kuzatilmoqda. Xatolar boshlang'ich reytingingizga sezilarli ta'sir qiladi." : "Treat this case seriously. Your ability to detect subtle manipulation tactics is being monitored. Mistakes will significantly impact your initial rating."
  };

  // Tournaments
  data.tournaments = {
    waiting_operatives: lang === 'ru' ? "Ожидание оперативников..." : lang === 'uz' ? "Operativlarni kutish..." : "Waiting for Operatives...",
    share_code: lang === 'ru' ? "Поделитесь этим кодом или QR со своим отрядом" : lang === 'uz' ? "Ushbu kod yoki QR ni o'z guruhingiz bilan baham ko'ring" : "Share this code or QR with your squad",
    lobby_code: lang === 'ru' ? "Код лобби" : lang === 'uz' ? "Lobbi kodi" : "Lobby Code",
    ready: lang === 'ru' ? "Готов" : lang === 'uz' ? "Tayyor" : "Ready",
    scan_to_join: lang === 'ru' ? "СКАНИРОВАТЬ ДЛЯ ВХОДА" : lang === 'uz' ? "QO'SHILISH UCHUN SKANERLANG" : "SCAN TO JOIN",
    operatives: lang === 'ru' ? "Оперативники" : lang === 'uz' ? "Operativlar" : "Operatives",
    host: lang === 'ru' ? "Хост" : lang === 'uz' ? "Mezbon" : "Host",
    awaiting: lang === 'ru' ? "Ожидание подключения..." : lang === 'uz' ? "Ulanish kutilmoqda..." : "Awaiting connection...",
    simulate_join: lang === 'ru' ? "Симулировать вход игрока" : lang === 'uz' ? "O'yinchi qo'shilishini simulyatsiya qilish" : "Simulate Player Join",
    commence_op: lang === 'ru' ? "Начать операцию" : lang === 'uz' ? "Operatsiyani boshlash" : "Commence Operation",
    disband_squad: lang === 'ru' ? "Распустить отряд" : lang === 'uz' ? "Guruhni tarqatib yuborish" : "Disband Squad",
    title: lang === 'ru' ? "Многопользовательские операции" : lang === 'uz' ? "Ko'p o'yinchili operatsiyalar" : "Multiplayer Ops",
    subtitle: lang === 'ru' ? "Тренируйтесь вместе. Никому не доверяйте." : lang === 'uz' ? "Birga mashq qiling. Hech kimga ishonmang." : "Train together. Trust no one.",
    join_squad: lang === 'ru' ? "Присоединиться к отряду" : lang === 'uz' ? "Guruhga qo'shilish" : "Join Squad",
    create_squad: lang === 'ru' ? "Создать отряд" : lang === 'uz' ? "Guruh yaratish" : "Create Squad",
    enter_code: lang === 'ru' ? "Введите код лобби" : lang === 'uz' ? "Lobbi kodini kiriting" : "Enter Lobby Code",
    join_btn: lang === 'ru' ? "ВОЙТИ" : lang === 'uz' ? "QO'SHILISH" : "JOIN",
    or: lang === 'ru' ? "ИЛИ" : lang === 'uz' ? "YOKI" : "OR",
    scan_qr: lang === 'ru' ? "Сканировать QR оперативника" : lang === 'uz' ? "Operativ QR ni skanerlash" : "Scan Operative QR",
    tap_camera: lang === 'ru' ? "Нажмите, чтобы открыть камеру" : lang === 'uz' ? "Kamerani ochish uchun bosing" : "Tap to open camera",
    host_op: lang === 'ru' ? "Провести операцию" : lang === 'uz' ? "Operatsiyani o'tkazish" : "Host an Operation",
    host_desc: lang === 'ru' ? "Создайте безопасное лобби и пригласите до 3 других оперативников. Вы будете соревноваться в одних и тех же делах одновременно." : lang === 'uz' ? "Xavfsiz lobbi yarating va 3 tagacha boshqa operativlarni taklif qiling. Siz bir vaqtning o'zida bir xil ishlarda raqobatlashasiz." : "Create a secure lobby and invite up to 3 other operatives. You will compete on the same cases simultaneously.",
    game_mode: lang === 'ru' ? "Режим игры" : lang === 'uz' ? "O'yin rejimi" : "Game Mode",
    standard_ops: lang === 'ru' ? "Стандартные операции" : lang === 'uz' ? "Standart operatsiyalar" : "Standard Ops",
    difficulty: lang === 'ru' ? "Сложность" : lang === 'uz' ? "Qiyinchilik" : "Difficulty",
    adaptive: lang === 'ru' ? "Адаптивная" : lang === 'uz' ? "Moslashuvchan" : "Adaptive",
    max_squad: lang === 'ru' ? "Макс. размер отряда" : lang === 'uz' ? "Maksimal guruh hajmi" : "Max Squad Size",
    operatives_count: lang === 'ru' ? "Оперативников" : lang === 'uz' ? "Operativlar" : "Operatives",
    create_lobby: lang === 'ru' ? "Создать лобби" : lang === 'uz' ? "Lobbi yaratish" : "Create Lobby",
    global_ops: lang === 'ru' ? "Глобальные операции" : lang === 'uz' ? "Global operatsiyalar" : "Global Operations",
    no_global: lang === 'ru' ? "В настоящее время нет активных глобальных турниров." : lang === 'uz' ? "Hozirda faol global turnirlar yo'q." : "No global tournaments active currently.",
    check_back: lang === 'ru' ? "Зайдите позже или создайте свой отряд." : lang === 'uz' ? "Keyinroq tekshiring yoki o'z guruhingizni yarating." : "Check back later or start your own squad."
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

try {
  updateJson(enPath, 'en');
  updateJson(ruPath, 'ru');
  updateJson(uzPath, 'uz');
  console.log("JSON files updated successfully.");
} catch(err) {
  console.error("Error updating JSON files:", err);
}
