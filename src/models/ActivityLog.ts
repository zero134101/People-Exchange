import mongoose, { Schema, Model, Document } from "mongoose"

export interface IActivityLogDoc extends Document {
  userId: mongoose.Types.ObjectId
  discordId: string
  date: string
  messages: number
  voiceMinutes: number
  attendance: boolean
  events: number
  contribution: number
  referrals: number
  createdAt: Date
}

const ActivityLogSchema = new Schema<IActivityLogDoc>({
  userId:       { type: Schema.Types.ObjectId, ref: "User", required: true },
  discordId:    { type: String, required: true },
  date:         { type: String, required: true },
  messages:     { type: Number, default: 0 },
  voiceMinutes: { type: Number, default: 0 },
  attendance:   { type: Boolean, default: false },
  events:       { type: Number, default: 0 },
  contribution: { type: Number, default: 0 },
  referrals:    { type: Number, default: 0 },
}, { timestamps: true })

ActivityLogSchema.index({ userId: 1, date: 1 }, { unique: true })

export const ActivityLog: Model<IActivityLogDoc> = mongoose.models.ActivityLog || mongoose.model<IActivityLogDoc>("ActivityLog", ActivityLogSchema)
