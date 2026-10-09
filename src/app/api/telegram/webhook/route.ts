import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { TelegramRelay } from "@/models/TelegramRelay";
import { customerOrderMessage, type OrderStatus } from "@/lib/order";
import { ownerChatId, sendTelegramMessage, telegramApi } from "@/lib/telegram";

export const dynamic = "force-dynamic";

interface TgChat {
  id: number;
  type: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  title?: string;
}

interface TgUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface TgMessage {
  message_id: number;
  chat: TgChat;
  from?: TgUser;
  text?: string;
  reply_to_message?: TgMessage;
}

interface TgCallbackQuery {
  id: string;
  from: TgUser;
  data?: string;
  message?: TgMessage;
}

interface TgUpdate {
  message?: TgMessage;
  edited_message?: TgMessage;
  callback_query?: TgCallbackQuery;
}

const ACTIONS: Record<string, OrderStatus> = {
  confirm: "confirmed",
  deliver: "delivered",
  cancel: "cancelled",
};

function authorized(request: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return true;
  return request.headers.get("x-telegram-bot-api-secret-token") === secret;
}

function displayName(message: TgMessage): string {
  const from = message.from;
  if (!from) return message.chat.title ?? "Customer";
  return [from.first_name, from.last_name].filter(Boolean).join(" ") || from.username || "Customer";
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TgUpdate;
  try {
    update = (await request.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const owner = ownerChatId();

  let dbReady = true;
  try {
    await connectDB();
  } catch (error) {
    dbReady = false;
    console.error("[telegram webhook] db unavailable:", error);
  }

  // ---- Owner taps a status button on an order notification ----
  const callback = update.callback_query;
  if (callback) {
    if (!owner || String(callback.from.id) !== owner) {
      await telegramApi("answerCallbackQuery", {
        callback_query_id: callback.id,
        text: "Not authorized.",
      });
      return NextResponse.json({ ok: true });
    }

    const [action, orderNumber] = (callback.data ?? "").split(":");
    const status = ACTIONS[action];

    if (!status || !orderNumber || !dbReady) {
      await telegramApi("answerCallbackQuery", {
        callback_query_id: callback.id,
        text: "Could not update the order.",
      });
      return NextResponse.json({ ok: true });
    }

    const order = await Order.findOneAndUpdate(
      { orderNumber },
      { $set: { status } },
      { new: true }
    ).lean();

    if (!order) {
      await telegramApi("answerCallbackQuery", {
        callback_query_id: callback.id,
        text: "Order not found.",
      });
      return NextResponse.json({ ok: true });
    }

    await telegramApi("answerCallbackQuery", {
      callback_query_id: callback.id,
      text: `Order ${orderNumber} → ${status}.`,
    });

    // Tell the customer, if they've already opened the bot.
    if (order.customerChatId) {
      await sendTelegramMessage(
        order.customerChatId,
        customerOrderMessage(order, order.customer.name)
      );
    }

    // Reflect the new status on the owner's message and drop the buttons.
    if (callback.message) {
      await telegramApi("editMessageReplyMarkup", {
        chat_id: callback.message.chat.id,
        message_id: callback.message.message_id,
        reply_markup: { inline_keyboard: [[{ text: `Status: ${status}`, callback_data: "noop" }]] },
      });
    }

    return NextResponse.json({ ok: true });
  }

  const message = update.message ?? update.edited_message;
  if (!message?.text) return NextResponse.json({ ok: true });

  const text = message.text.trim();
  const fromId = String(message.chat.id);

  // ---- Owner replying to a forwarded customer message -> relay to the customer ----
  if (owner && fromId === owner) {
    const repliedTo = message.reply_to_message?.message_id;
    if (dbReady && repliedTo) {
      const relay = await TelegramRelay.findOne({ ownerMessageId: repliedTo }).lean();
      if (relay) {
        await sendTelegramMessage(relay.customerChatId, text);
        return NextResponse.json({ ok: true });
      }
    }
    await sendTelegramMessage(
      owner,
      "ℹ️ To reply to a customer, use Telegram's Reply on their forwarded message."
    );
    return NextResponse.json({ ok: true });
  }

  // ---- Customer message ----
  const name = displayName(message);
  const username = message.chat.username ? `@${message.chat.username}` : "no username";

  if (text.startsWith("/start")) {
    const orderNumber = text.split(/\s+/)[1]?.trim() ?? "";

    let order = null;
    if (dbReady && orderNumber) {
      order = await Order.findOne({ orderNumber }).lean();
      if (order && !order.customerChatId) {
        await Order.updateOne(
          { orderNumber },
          { $set: { customerChatId: fromId, customerUsername: message.chat.username ?? "" } }
        );
      }
    }

    const first = name.split(/\s+/)[0] || "there";
    const confirmation = order
      ? customerOrderMessage(order, name)
      : `👋 Hi ${first}! Welcome to Yamone Cosmetics. How can we help you today?`;

    await sendTelegramMessage(fromId, confirmation);

    if (owner) {
      const header = order
        ? `🔔 ${name} (${username}, id ${fromId}) opened the bot for order #${order.orderNumber} — status ${order.status}.`
        : `🔔 ${name} (${username}, id ${fromId}) started the bot.`;
      const result = await sendTelegramMessage(
        owner,
        `${header}\n\nReply to this message to chat with them.`
      );
      if (dbReady && result.ok && result.messageId) {
        await TelegramRelay.create({
          ownerMessageId: result.messageId,
          customerChatId: fromId,
          customerName: name,
        });
      }
    }

    return NextResponse.json({ ok: true });
  }

  // ---- Any other customer message -> forward to the owner ----
  if (owner) {
    const forwarded = `📨 ${name} (${username}, id ${fromId}):\n\n${text}`;
    const result = await sendTelegramMessage(owner, forwarded);
    if (dbReady && result.ok && result.messageId) {
      await TelegramRelay.create({
        ownerMessageId: result.messageId,
        customerChatId: fromId,
        customerName: name,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
