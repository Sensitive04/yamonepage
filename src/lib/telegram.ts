const TELEGRAM_API = "https://api.telegram.org";

export function botUsername(): string {
  return (process.env.TELEGRAM_BOT_USERNAME ?? "").replace(/^@/, "");
}

export function ownerChatId(): string {
  return (process.env.TELEGRAM_CHAT_ID ?? "").trim();
}

export function buildBotLink(orderNumber?: string): string {
  const username = botUsername();
  if (!username) return "";
  return `https://t.me/${username}${orderNumber ? `?start=${encodeURIComponent(orderNumber)}` : ""}`;
}

interface ApiResult<T> {
  ok: boolean;
  result?: T;
  error?: string;
}

export async function telegramApi<T = unknown>(
  method: string,
  body: Record<string, unknown> = {}
): Promise<ApiResult<T>> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN not configured" };

  try {
    const response = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = (await response.json()) as {
      ok: boolean;
      result?: T;
      description?: string;
    };

    if (!data.ok) return { ok: false, error: data.description ?? "telegram-error" };
    return { ok: true, result: data.result };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "network error",
    };
  }
}

export interface SendResult {
  ok: boolean;
  messageId?: number;
  error?: string;
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options?: { replyMarkup?: unknown }
): Promise<SendResult> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  };
  if (options?.replyMarkup) body.reply_markup = options.replyMarkup;

  const result = await telegramApi<{ message_id: number }>("sendMessage", body);
  return result.ok
    ? { ok: true, messageId: result.result?.message_id }
    : { ok: false, error: result.error };
}

export type OrderKeyboardStatus = "new" | "confirmed" | "delivered" | "cancelled";

export function orderKeyboard(orderNumber: string, status: OrderKeyboardStatus = "new") {
  if (status === "new") {
    return {
      inline_keyboard: [
        [{ text: "✅ Confirm order", callback_data: `confirm:${orderNumber}` }],
        [{ text: "❌ Cancel order", callback_data: `cancel:${orderNumber}` }],
      ],
    };
  }

  if (status === "confirmed") {
    return {
      inline_keyboard: [
        [{ text: "🚚 Mark delivered", callback_data: `deliver:${orderNumber}` }],
        [{ text: "❌ Cancel order", callback_data: `cancel:${orderNumber}` }],
      ],
    };
  }

  return {
    inline_keyboard: [
      [{ text: status === "delivered" ? "🚚 Delivered" : "❌ Cancelled", callback_data: "noop" }],
    ],
  };
}
