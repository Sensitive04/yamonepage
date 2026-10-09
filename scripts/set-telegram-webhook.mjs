import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";

const arg = process.argv[2] ?? "";
const url = arg.startsWith("http") ? arg : process.env.TELEGRAM_WEBHOOK_URL ?? "";

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is not set. Add it to .env first.");
  process.exit(1);
}

async function call(method, body) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return response.json();
}

async function main() {
  if (!url || arg.toLowerCase() === "delete") {
    const result = await call("deleteWebhook", { drop_pending_updates: false });
    console.log("deleteWebhook:", JSON.stringify(result));
    process.exit(result.ok ? 0 : 1);
  }

  if (!url.startsWith("https://")) {
    console.error("Webhook URL must start with https:// — got:", url);
    process.exit(1);
  }

  const result = await call("setWebhook", {
    url,
    secret_token: secret || undefined,
    allowed_updates: ["message", "edited_message", "callback_query"],
  });

  console.log("setWebhook:", JSON.stringify(result));
  process.exit(result.ok ? 0 : 1);
}

main();
