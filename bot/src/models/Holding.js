const mongoose = require("mongoose");

const HoldingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock", required: true },
    quantity: { type: Number, required: true, min: 0 },
    avgPrice: { type: Number, required: true },
    purchasedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

HoldingSchema.index({ userId: 1, stockId: 1 }, { unique: true });

module.exports =
  mongoose.models.Holding || mongoose.model("Holding", HoldingSchema);
