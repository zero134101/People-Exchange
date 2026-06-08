const mongoose = require("mongoose");

const ExchangeRateSchema = new mongoose.Schema(
  {
    messageWeight: { type: Number, default: 0.2 },
    voiceWeight: { type: Number, default: 0.2 },
    attendanceWeight: { type: Number, default: 0.2 },
    eventWeight: { type: Number, default: 0.15 },
    contributionWeight: { type: Number, default: 0.1 },
    referralWeight: { type: Number, default: 0.1 },
    reputationWeight: { type: Number, default: 0.05 },
    basePrice: { type: Number, default: 1000 },
    dividendRate: { type: Number, default: 0.2 },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ExchangeRate || mongoose.model("ExchangeRate", ExchangeRateSchema);
