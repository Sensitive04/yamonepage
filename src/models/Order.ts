import { Schema, model, models, type Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IOrderCustomer {
  name: string;
  phone: string;
  address: string;
}

export interface IOrder {
  orderNumber: string;
  items: IOrderItem[];
  customer: IOrderCustomer;
  subtotal: number;
  shipping: number;
  total: number;
  status: "new" | "confirmed" | "delivered" | "cancelled";
  customerChatId?: string;
  customerUsername?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    items: [
      {
        _id: false,
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, default: "" },
      },
    ],
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
    },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["new", "confirmed", "delivered", "cancelled"],
      default: "new",
    },
    customerChatId: { type: String, default: "" },
    customerUsername: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  (models.Order as Model<IOrder>) ?? model<IOrder>("Order", OrderSchema);
