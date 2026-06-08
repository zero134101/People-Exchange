const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["buy", "sell", "deposit", "withdraw", "dividend", "fee"],
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
    amount: { type: Number, required: true },
    price: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
