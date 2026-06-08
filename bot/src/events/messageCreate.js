const { ActivityLog } = require("../models/ActivityLog");
const { connectDB } = require("../utils/db");

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;

    await connectDB();
    const today = new Date().toISOString().slice(0, 10);

    await ActivityLog.findOneAndUpdate(
      { discordId: message.author.id, date: today },
      { $inc: { messages: 1 } },
      { upsert: true, setDefaultsOnInsert: true }
    );
  },
};
