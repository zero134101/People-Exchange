import mongoose, { Schema, Model, Document } from "mongoose"

export interface IExchangeRateDoc extends Document {
  messageWeight: number
  voiceWeight: number
  attendanceWeight: number
  eventWeight: number
  contributionWeight: number
  referralWeight: number
  reputationWeight: number
  basePrice: number
  dividendRate: number
  createdAt: Date
}

const ExchangeRateSchema = new Schema<IExchangeRateDoc>({
  messageWeight:     { type: Number, default: 0.2 },
  voiceWeight:       { type: Number, default: 0.2 },
  attendanceWeight:  { type: Number, default: 0.2 },
  eventWeight:       { type: Number, default: 0.15 },
  contributionWeight: { type: Number, default: 0.1 },
  referralWeight:    { type: Number, default: 0.1 },
  reputationWeight:  { type: Number, default: 0.05 },
  basePrice:         { type: Number, default: 1000 },
  dividendRate:      { type: Number, default: 0.2 },
}, { timestamps: true })

export const ExchangeRate: Model<IExchangeRateDoc> = mongoose.models.ExchangeRate || mongoose.model<IExchangeRateDoc>("ExchangeRate", ExchangeRateSchema)
