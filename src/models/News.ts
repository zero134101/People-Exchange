import mongoose, { Schema, Model, Document } from "mongoose"

export interface INewsDoc extends Document {
  title: string
  content: string
  type: 'activity_surge' | 'inactive' | 'event_win' | 'ipo' | 'general'
  relatedUserIds: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const NewsSchema = new Schema<INewsDoc>({
  title:          { type: String, required: true },
  content:        { type: String, required: true },
  type:           { type: String, enum: ['activity_surge', 'inactive', 'event_win', 'ipo', 'general'], required: true },
  relatedUserIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true })

export const News: Model<INewsDoc> = mongoose.models.News || mongoose.model<INewsDoc>("News", NewsSchema)
