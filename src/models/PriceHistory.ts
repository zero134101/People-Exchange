import mongoose, { Schema, Model, Document } from "mongoose"

export interface IPriceHistoryDoc extends Document {
  stockId: mongoose.Types.ObjectId
  price: number
  recordedAt: Date
  createdAt: Date
}

const PriceHistorySchema = new Schema<IPriceHistoryDoc>({
  stockId:    { type: Schema.Types.ObjectId, ref: "Stock", required: true },
  price:      { type: Number, required: true },
  recordedAt: { type: Date, default: Date.now },
}, { timestamps: true })

PriceHistorySchema.index({ stockId: 1, recordedAt: -1 })

export const PriceHistory: Model<IPriceHistoryDoc> = mongoose.models.PriceHistory || mongoose.model<IPriceHistoryDoc>("PriceHistory", PriceHistorySchema)
