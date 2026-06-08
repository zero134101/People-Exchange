const { ActivityLog } = require("../models/ActivityLog");
const { connectDB } = require("../utils/db");

const voiceTimers = new Map();

module.exports = {
  name: "voiceStateUpdate",
  async execute(oldState, newState) {
    await connectDB();

    // User joined a voice channel
    if (!oldState.channelId && newState.channelId) {
      voiceTimers.set(newState.member.id, Date.now());
    }

    // User left a voice channel
    if (oldState.channelId && !newState.channelId) {
      const startTime = voiceTimers.get(oldState.member.id);
      if (startTime) {
        const durationMinutes = Math.round((Date.now() - startTime) / 60000);
        if (durationMinutes > 0) {
          const today = new Date().toISOString().slice(0, 10);
          await ActivityLog.findOneAndUpdate(
            { discordId: oldState.member.id, date: today },
            { $inc: { voiceMinutes: durationMinutes } },
            { upsert: true }
          );
        }
        voiceTimers.delete(oldState.member.id);
      }
    }
  },
};
