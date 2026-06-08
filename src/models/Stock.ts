import mongoose, { Schema, Model, Document } from "mongoose"

export interface IStockDoc extends Document {
  userId: mongoose.Types.ObjectId
  status: 'pending' | 'listed' | 'delisted' | 'rejected'
  currentPrice: number
  marketCap: number
  totalShares: number
  grade: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  isPublic: boolean
  listedAt: Date
  activityMetrics: {
    messages: number
    voice: number
    attendance: number
    events: number
    contribution: number
    referrals: number
  }
  createdAt: Date
  updatedAt: Date
}

const StockSchema = new Schema<IStockDoc>({
  userId:       { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  status:       { type: String, enum: ['pending', 'listed', 'delisted', 'rejected'], default: 'pending' },
  currentPrice: { type: Number, default: 1000 },
  marketCap:    { type: Number, default: 0 },
  totalShares:  { type: Number, default: 1000 },
  grade:        { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], default: 'bronze' },
  isPublic:     { type: Boolean, default: true },
  listedAt:     { type: Date },
  activityMetrics: {
    messages:     { type: Number, default: 0 },
    voice:        { type: Number, default: 0 },
    attendance:   { type: Number, default: 0 },
    events:       { type: Number, default: 0 },
    contribution: { type: Number, default: 0 },
    referrals:    { type: Number, default: 0 },
  },
}, { timestamps: true })

export const Stock: Model<IStockDoc> = mongoose.models.Stock || mongoose.model<IStockDoc>("Stock", StockSchema)
