import { Schema, model, models, type Model } from "mongoose";

export interface ITelegramRelay {
  ownerMessageId: number;
  customerChatId: string;
  customerName: string;
  createdAt: Date;
}

const TelegramRelaySchema = new Schema<ITelegramRelay>(
  {
    ownerMessageId: { type: Number, required: true, unique: true, index: true },
    customerChatId: { type: String, required: true },
    customerName: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
  },
  { versionKey: false }
);

export const TelegramRelay: Model<ITelegramRelay> =
  (models.TelegramRelay as Model<ITelegramRelay>) ??
  model<ITelegramRelay>("TelegramRelay", TelegramRelaySchema);
