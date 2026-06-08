const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["activity_surge", "inactive", "event_win", "ipo", "general"],
      required: true,
    },
    relatedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.News || mongoose.model("News", NewsSchema);
