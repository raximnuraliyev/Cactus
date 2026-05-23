import { query } from '../config/database.js';
import { sendTelegramMessage } from '../config/telegram.js';

export class NotificationService {
  async sendDailyReminders(): Promise<number> {
    const result = await query<{
      telegram_id: number;
      username: string;
      language: string;
    }>(
      `SELECT u.telegram_id, u.username, u.language
       FROM users u
       INNER JOIN user_stats us ON us.user_id = u.id
       WHERE u.notify_daily = true
         AND u.telegram_id IS NOT NULL
         AND u.deleted_at IS NULL
         AND (us.last_played_at IS NULL OR us.last_played_at < CURRENT_DATE)`
    );

    let sentCount = 0;

    for (const user of result.rows) {
      if (!user.telegram_id) continue;

      const message = this.getDailyMessage(user.username, user.language);
      const sent = await sendTelegramMessage(user.telegram_id, message);
      if (sent) sentCount++;

      // Small delay to avoid Telegram rate limits
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    console.log(`[Notifications] Sent ${sentCount} daily reminders`);
    return sentCount;
  }

  async sendBadgeNotification(
    telegramId: number | null,
    badgeName: string,
    language: string
  ): Promise<void> {
    if (!telegramId) return;

    const messages: Record<string, string> = {
      en: `🏆 Congratulations! You've earned a new badge: <b>${badgeName}</b>! Keep up the great detective work!`,
      ru: `🏆 Поздравляем! Вы получили новый значок: <b>${badgeName}</b>! Продолжайте отличную детективную работу!`,
      uz: `🏆 Tabriklaymiz! Siz yangi nishon oldingiz: <b>${badgeName}</b>! Ajoyib tergovchi ishini davom eting!`,
    };

    const message = messages[language] ?? messages['en']!;
    await sendTelegramMessage(telegramId, message);
  }

  async sendStreakWarning(
    telegramId: number | null,
    currentStreak: number,
    language: string
  ): Promise<void> {
    if (!telegramId) return;

    const messages: Record<string, string> = {
      en: `⚠️ Your ${currentStreak}-day streak is about to expire! Play a game today to keep it going! 🔥`,
      ru: `⚠️ Ваша серия из ${currentStreak} дней скоро закончится! Сыграйте сегодня, чтобы сохранить её! 🔥`,
      uz: `⚠️ Sizning ${currentStreak} kunlik seriyangiz tugayapti! Uni saqlab qolish uchun bugun o'ynang! 🔥`,
    };

    const message = messages[language] ?? messages['en']!;
    await sendTelegramMessage(telegramId, message);
  }

  private getDailyMessage(username: string, language: string): string {
    const messages: Record<string, string> = {
      en: `🕵️ Hey ${username}! A new daily challenge is waiting for you in <b>Real or Fake?</b> Can you spot today's fraud? Play now!`,
      ru: `🕵️ Привет, ${username}! Новое ежедневное задание ждёт вас в <b>Real or Fake?</b> Сможете ли вы раскрыть сегодняшнее мошенничество? Играйте сейчас!`,
      uz: `🕵️ Salom ${username}! <b>Real or Fake?</b> da yangi kunlik topshiriq sizni kutmoqda. Bugungi firibgarni topa olasizmi? Hozir o'ynang!`,
    };

    return messages[language] ?? messages['en']!;
  }
  async sendStreakProtectionAlerts(): Promise<number> {
    const result = await query<{
      telegram_id: number;
      username: string;
      language: string;
      current_streak: number;
    }>(
      `SELECT u.telegram_id, u.username, u.language, us.current_streak
       FROM users u
       INNER JOIN user_stats us ON us.user_id = u.id
       WHERE u.notify_daily = true
         AND u.telegram_id IS NOT NULL
         AND us.current_streak > 0
         AND (us.last_played_at IS NULL OR us.last_played_at < CURRENT_DATE)`
    );

    let sentCount = 0;
    for (const user of result.rows) {
      if (!user.telegram_id) continue;
      await this.sendStreakWarning(user.telegram_id, user.current_streak, user.language);
      sentCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    console.log(`[Notifications] Sent ${sentCount} streak warnings`);
    return sentCount;
  }
}
