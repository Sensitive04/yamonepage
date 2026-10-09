import { NextResponse, type NextRequest } from "next/server";
import { connectDB, isDatabaseError } from "@/lib/db";
import { Order } from "@/models/Order";
import { buildOrderMessage, createOrderNumber, orderTotals } from "@/lib/order";
import { buildBotLink, orderKeyboard, ownerChatId, sendTelegramMessage } from "@/lib/telegram";
import type { CartItem } from "@/lib/types";

export const dynamic = "force-dynamic";

interface OrderItemInput {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

function parseItems(value: unknown): OrderItemInput[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const items: OrderItemInput[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") return null;
    const item = raw as Record<string, unknown>;
    const name = typeof item.name === "string" ? item.name.trim() : "";
    const price = typeof item.price === "number" ? item.price : NaN;
    const quantity = typeof item.quantity === "number" ? item.quantity : NaN;

    if (!name || !Number.isFinite(price) || price < 0 || !Number.isFinite(quantity) || quantity < 1) {
      return null;
    }

    items.push({
      productId: typeof item.productId === "string" ? item.productId : "",
      name,
      price,
      quantity,
      image: typeof item.image === "string" ? item.image : "",
    });
  }
  return items;
}

function parseCustomer(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const customer = value as Record<string, unknown>;
  const name = typeof customer.name === "string" ? customer.name.trim() : "";
  const phone = typeof customer.phone === "string" ? customer.phone.trim() : "";
  const address = typeof customer.address === "string" ? customer.address.trim() : "";

  if (name.length < 2 || phone.length < 5 || address.length < 5) return null;
  return { name, phone, address };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const payload = (body ?? {}) as { items?: unknown; customer?: unknown };
  const items = parseItems(payload.items);
  const customer = parseCustomer(payload.customer);

  if (!items) {
    return NextResponse.json({ error: "Your bag is empty or contains invalid items." }, { status: 400 });
  }
  if (!customer) {
    return NextResponse.json({ error: "Invalid customer details." }, { status: 400 });
  }

  const { subtotal, shipping, total } = orderTotals(items);
  const orderNumber = createOrderNumber();
  const botLink = buildBotLink(orderNumber);

  try {
    await connectDB();
    await Order.create({ orderNumber, items, customer, subtotal, shipping, total });

    const chatId = ownerChatId();
    if (chatId) {
      await sendTelegramMessage(chatId, buildOrderMessage(items as CartItem[], customer, orderNumber), {
        replyMarkup: orderKeyboard(orderNumber),
      });
    }

    return NextResponse.json({ orderNumber, botLink }, { status: 201 });
  } catch (error) {
    const status = isDatabaseError(error) ? 503 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order." },
      { status }
    );
  }
}
