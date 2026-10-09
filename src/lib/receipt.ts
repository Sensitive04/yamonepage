import { jsPDF } from "jspdf";
import { CURRENCY, deliveryFee, formatPrice } from "@/lib/constants";
import type { CartItem } from "@/lib/types";

export interface ReceiptCustomer {
  name: string;
  phone: string;
  address: string;
}

export function generateInvoicePdf(
  items: CartItem[],
  customer: ReceiptCustomer,
  orderNumber: string
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = deliveryFee(subtotal);
  const total = subtotal + shipping;
  const issuedAt = new Date();

  // Brand header band
  doc.setFillColor(44, 31, 29);
  doc.rect(0, 0, pageWidth, 104, "F");
  doc.setFillColor(183, 110, 121);
  doc.rect(0, 104, pageWidth, 5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.text("Yamone Cosmetics", margin, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(216, 160, 167);
  doc.text("P R E M I U M   B E A U T Y   S T U D I O", margin, 70);

  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", pageWidth - margin, 46, { align: "right" });
  doc.setFontSize(9);
  doc.setTextColor(216, 160, 167);
  doc.text(`#${orderNumber}`, pageWidth - margin, 62, { align: "right" });
  doc.text(
    issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    pageWidth - margin,
    76,
    { align: "right" }
  );

  let y = 150;

  // Customer block
  doc.setTextColor(138, 115, 112);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("BILLED TO", margin, y);

  doc.setTextColor(44, 31, 29);
  doc.setFontSize(12);
  doc.text(customer.name, margin, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(`Phone: ${customer.phone}`, margin, y + 33);
  const addressLines = doc.splitTextToSize(`Address: ${customer.address}`, contentWidth / 2);
  doc.text(addressLines, margin, y + 48);

  // Totals block (right column)
  const totalsX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(138, 115, 112);
  doc.text("SUMMARY", totalsX, y, { align: "right" });

  doc.setFontSize(9.5);
  doc.setTextColor(44, 31, 29);
  doc.text("Subtotal", totalsX - 90, y + 18);
  doc.text(formatPrice(subtotal), totalsX, y + 18, { align: "right" });
  doc.text("Delivery", totalsX - 90, y + 33);
  doc.text(shipping === 0 ? "Free" : formatPrice(shipping), totalsX, y + 33, { align: "right" });

  doc.setDrawColor(183, 110, 121);
  doc.setLineWidth(0.8);
  doc.line(totalsX - 130, y + 43, totalsX, y + 43);

  doc.setFontSize(12);
  doc.text("TOTAL", totalsX - 90, y + 60);
  doc.text(`${CURRENCY}${total.toFixed(2)}`, totalsX, y + 60, { align: "right" });

  y += 100;

  // Items table header
  doc.setFillColor(251, 241, 239);
  doc.rect(margin, y, contentWidth, 26, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(183, 110, 121);

  const col = {
    item: margin + 10,
    qty: margin + contentWidth - 190,
    price: margin + contentWidth - 130,
    amount: margin + contentWidth - 10,
  };

  doc.text("ITEM", col.item, y + 17);
  doc.text("QTY", col.qty, y + 17);
  doc.text("UNIT", col.price, y + 17, { align: "right" });
  doc.text("AMOUNT", col.amount, y + 17, { align: "right" });

  y += 26;

  // Items rows
  items.forEach((item, index) => {
    if (y > 700) {
      doc.addPage();
      y = 60;
    }

    if (index % 2 === 1) {
      doc.setFillColor(252, 247, 245);
      doc.rect(margin, y, contentWidth, 30, "F");
    }

    doc.setTextColor(44, 31, 29);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const name = doc.splitTextToSize(item.name, contentWidth - 220)[0] as string;
    doc.text(name, col.item, y + 19);
    doc.text(String(item.quantity), col.qty, y + 19);
    doc.text(formatPrice(item.price), col.price, y + 19, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(formatPrice(item.price * item.quantity), col.amount, y + 19, { align: "right" });

    y += 30;
  });

  // Footer note
  if (y > 680) {
    doc.addPage();
    y = 60;
  }

  doc.setDrawColor(246, 228, 224);
  doc.setLineWidth(1);
  doc.line(margin, y + 16, pageWidth - margin, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(138, 115, 112);
  doc.text(
    "Thank you for shopping with Yamone Cosmetics. This invoice was generated automatically.",
    margin,
    y + 38
  );
  doc.text(
    "Payment is settled on delivery / confirmation via Telegram.",
    margin,
    y + 52
  );

  doc.setFillColor(44, 31, 29);
  doc.rect(0, doc.internal.pageSize.getHeight() - 40, pageWidth, 40, "F");
  doc.setTextColor(216, 160, 167);
  doc.setFontSize(8.5);
  doc.text(
    "Yamone Cosmetics  •  Premium skincare, makeup & haircare",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 16,
    { align: "center" }
  );

  doc.save(`yamone-invoice-${orderNumber}.pdf`);
}
