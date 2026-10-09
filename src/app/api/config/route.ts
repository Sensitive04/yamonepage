import { NextResponse } from "next/server";

export async function GET() {
  const telegramBotUsername = (process.env.TELEGRAM_BOT_USERNAME ?? "").replace(
    /^@/,
    ""
  );

  return NextResponse.json({ telegramBotUsername });
}
