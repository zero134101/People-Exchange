const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    avatar: { type: String, default: "" },
    krwBalance: { type: Number, default: 10 },
    reputation: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    isAdmin: { type: Boolean, default: false },
    isListed: { type: Boolean, default: false },
    bankAccount: {
      bank: { type: String },
      number: { type: String },
      holder: { type: String },
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.User || mongoose.model("User", UserSchema);
