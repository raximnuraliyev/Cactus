import crypto from 'node:crypto';
import { env } from './env.js';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramInitData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  };
  auth_date: number;
  hash: string;
}

export function validateTelegramInitData(initDataRaw: string): TelegramInitData | null {
  try {
    const params = new URLSearchParams(initDataRaw);
    const hash = params.get('hash');
    if (!hash) return null;

    params.delete('hash');

    const sortedEntries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
    const dataCheckString = sortedEntries.map(([k, v]) => `${k}=${v}`).join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(env.TELEGRAM_BOT_TOKEN)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) return null;

    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) return null;

    const userStr = params.get('user');
    const user = userStr ? JSON.parse(userStr) : undefined;

    return {
      query_id: params.get('query_id') || undefined,
      user,
      auth_date: authDate,
      hash,
    };
  } catch {
    return null;
  }
}

export async function sendTelegramMessage(
  chatId: number,
  text: string
): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
    return response.ok;
  } catch (err) {
    console.error('[Telegram] Failed to send message:', err);
    return false;
  }
}

export function startTelegramBot() {
  if (!env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN.includes('your_telegram_bot_token_here')) {
    console.log('[Telegram Bot] Token not configured, skipping bot polling.');
    return;
  }

  let offset = 0;
  
  const poll = async () => {
    try {
      const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=30`;
      const response = await fetch(url);
      if (response.ok) {
        const data: any = await response.json();
        if (data.ok && data.result.length > 0) {
          console.log('[Telegram Bot] Received updates:', JSON.stringify(data.result, null, 2));
          for (const update of data.result) {
            offset = update.update_id + 1;
            
            if (update.message && update.message.text && update.message.text.startsWith('/start')) {
              const chatId = update.message.chat.id;
              await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: 'Welcome to <b>Real or Fake?</b>\n\nAre you ready to test your detective skills? Tap the button below to launch the Mini App!',
                  parse_mode: 'HTML',
                  reply_markup: {
                    inline_keyboard: [[
                      { text: '🕵️‍♂️ Play Now', web_app: { url: env.APP_URL } }
                    ]]
                  }
                }),
              });
            }
          }
        }
      } else {
        const errText = await response.text();
        console.error('[Telegram Bot] Polling returned not ok:', response.status, errText);
      }
    } catch (err) {
      console.error('[Telegram Bot] Polling error:', err);
    }
    
    // Poll again
    setTimeout(poll, 1000);
  };
  console.log('[Telegram Bot] Starting bot initialization...');
  
  // Clear any existing webhook to ensure getUpdates works
  fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/deleteWebhook`)
    .then(res => res.json())
    .then(data => {
      console.log('[Telegram Bot] Webhook cleared:', data);
      console.log('[Telegram Bot] Started long polling for /start command');
      poll();
    })
    .catch(err => {
      console.error('[Telegram Bot] Failed to clear webhook:', err);
      poll(); // Try polling anyway
    });
}
