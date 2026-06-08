import mongoose, { Schema, Model, Document } from "mongoose"

export interface IUserDoc extends Document {
  discordId: string
  username: string
  avatar: string
  krwBalance: number
  reputation: number
  joinedAt: Date
  isAdmin: boolean
  isListed: boolean
  bankAccount?: {
    bank: string
    number: string
    holder: string
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUserDoc>({
  discordId:   { type: String, required: true, unique: true },
  username:    { type: String, required: true },
  avatar:      { type: String, default: "" },
  krwBalance:  { type: Number, default: 10 },
  reputation:  { type: Number, default: 0 },
  joinedAt:    { type: Date, default: Date.now },
  isAdmin:     { type: Boolean, default: false },
  isListed:    { type: Boolean, default: false },
  bankAccount: {
    bank:   { type: String },
    number: { type: String },
    holder: { type: String },
  },
}, { timestamps: true })

export const User: Model<IUserDoc> = mongoose.models.User || mongoose.model<IUserDoc>("User", UserSchema)
