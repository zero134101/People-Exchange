import mongoose, { Schema, Model, Document } from "mongoose"

export interface ITransactionDoc extends Document {
  type: 'buy' | 'sell' | 'deposit' | 'withdraw' | 'dividend' | 'fee'
  userId: mongoose.Types.ObjectId
  stockId?: mongoose.Types.ObjectId
  amount: number
  price: number
  fee: number
  status: 'pending' | 'completed' | 'cancelled'
  description: string
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransactionDoc>({
  type:        { type: String, enum: ['buy', 'sell', 'deposit', 'withdraw', 'dividend', 'fee'], required: true },
  userId:      { type: Schema.Types.ObjectId, ref: "User", required: true },
  stockId:     { type: Schema.Types.ObjectId, ref: "Stock" },
  amount:      { type: Number, required: true },
  price:       { type: Number, required: true },
  fee:         { type: Number, default: 0 },
  status:      { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'completed' },
  description: { type: String, default: "" },
}, { timestamps: true })

export const Transaction: Model<ITransactionDoc> = mongoose.models.Transaction || mongoose.model<ITransactionDoc>("Transaction", TransactionSchema)
