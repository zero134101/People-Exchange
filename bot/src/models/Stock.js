const mongoose = require("mongoose");

const StockSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    status: { type: String, enum: ["pending", "listed", "delisted", "rejected"], default: "pending" },
    currentPrice: { type: Number, default: 1000 },
    marketCap: { type: Number, default: 0 },
    totalShares: { type: Number, default: 1000 },
    grade: { type: String, enum: ["bronze", "silver", "gold", "platinum", "diamond"], default: "bronze" },
    isPublic: { type: Boolean, default: true },
    listedAt: { type: Date },
    activityMetrics: {
      messages: { type: Number, default: 0 },
      voice: { type: Number, default: 0 },
      attendance: { type: Number, default: 0 },
      events: { type: Number, default: 0 },
      contribution: { type: Number, default: 0 },
      referrals: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Stock || mongoose.model("Stock", StockSchema);
