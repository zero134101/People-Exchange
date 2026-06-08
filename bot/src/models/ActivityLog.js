const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    discordId: { type: String, required: true },
    date: { type: String, required: true },
    messages: { type: Number, default: 0 },
    voiceMinutes: { type: Number, default: 0 },
    attendance: { type: Boolean, default: false },
    events: { type: Number, default: 0 },
    contribution: { type: Number, default: 0 },
    referrals: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ discordId: 1, date: 1 }, { unique: true });

module.exports =
  mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema);
