import { deliveryFee, formatPrice } from "@/lib/constants";
import type { CartItem } from "@/lib/types";

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
}

export type OrderStatus = "new" | "confirmed" | "delivered" | "cancelled";

export interface OrderSummary {
  orderNumber: string;
  total: number;
  status: OrderStatus;
  items: { name: string; quantity: number }[];
}

export function createOrderNumber(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `YC-${stamp}-${suffix}`;
}

export function orderTotals(items: Pick<CartItem, "price" | "quantity">[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = deliveryFee(subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
}

export function buildOrderMessage(
  items: CartItem[],
  customer: OrderCustomer,
  orderNumber: string
): string {
  const { subtotal, shipping, total } = orderTotals(items);
  const lines = items.map(
    (item, index) =>
      `${index + 1}. ${item.name} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`
  );

  return [
    `🛍️ NEW ORDER — Yamone Cosmetics`,
    `Order: #${orderNumber}`,
    ``,
    ...lines,
    ``,
    `Subtotal: ${formatPrice(subtotal)}`,
    `Delivery: ${shipping === 0 ? "Free" : formatPrice(shipping)}`,
    `TOTAL: ${formatPrice(total)}`,
    ``,
    `👤 Name: ${customer.name}`,
    `📞 Phone: ${customer.phone}`,
    `📍 Address: ${customer.address}`,
    ``,
    `Please confirm availability and delivery details. Thank you! 💕`,
  ].join("\n");
}

export function customerOrderMessage(order: OrderSummary, name: string): string {
  const first = name.trim().split(/\s+/)[0] || "there";
  const lines = order.items.map((item) => `• ${item.name} × ${item.quantity}`);

  const head: Record<OrderStatus, string> = {
    new: `🕐 Thank you ${first}! We've received your order #${order.orderNumber}.`,
    confirmed: `✅ Good news ${first}! Your order #${order.orderNumber} is CONFIRMED.`,
    delivered: `🚚 ${first}, your order #${order.orderNumber} has been delivered. Enjoy! 💕`,
    cancelled: `❌ ${first}, your order #${order.orderNumber} was cancelled.`,
  };

  const tail: Record<OrderStatus, string> = {
    new: "Status: PENDING confirmation — we'll message you here the moment it's confirmed.",
    confirmed: "We'll let you know again once it's on the way.",
    delivered: "Thank you for shopping with Yamone Cosmetics.",
    cancelled: "Reply here if you have any questions.",
  };

  return [
    head[order.status],
    "",
    ...lines,
    "",
    `Total: ${formatPrice(order.total)}`,
    "",
    tail[order.status],
  ].join("\n");
}
