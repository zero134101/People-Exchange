import mongoose, { Schema, Model, Document } from "mongoose"

export interface IHoldingDoc extends Document {
  userId: mongoose.Types.ObjectId
  stockId: mongoose.Types.ObjectId
  quantity: number
  avgPrice: number
  purchasedAt: Date
  createdAt: Date
}

const HoldingSchema = new Schema<IHoldingDoc>({
  userId:      { type: Schema.Types.ObjectId, ref: "User", required: true },
  stockId:     { type: Schema.Types.ObjectId, ref: "Stock", required: true },
  quantity:    { type: Number, required: true, min: 0 },
  avgPrice:    { type: Number, required: true },
  purchasedAt: { type: Date, default: Date.now },
}, { timestamps: true })

HoldingSchema.index({ userId: 1, stockId: 1 }, { unique: true })

export const Holding: Model<IHoldingDoc> = mongoose.models.Holding || mongoose.model<IHoldingDoc>("Holding", HoldingSchema)
