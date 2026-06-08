const mongoose = require("mongoose");

const PriceHistorySchema = new mongoose.Schema(
  {
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock", required: true },
    price: { type: Number, required: true },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PriceHistorySchema.index({ stockId: 1, recordedAt: -1 });

module.exports =
  mongoose.models.PriceHistory || mongoose.model("PriceHistory", PriceHistorySchema);
