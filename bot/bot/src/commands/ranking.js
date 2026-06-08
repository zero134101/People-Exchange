const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { connectDB } = require("../utils/db");
const Stock = require("../models/Stock");
const User = require("../models/User");

const gradeEmoji = {
  bronze: "🟤",
  silver: "⚪",
  gold: "🟡",
  platinum: "⚫",
  diamond: "💎",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("순위")
    .setDescription("시가총액 랭킹을 확인합니다"),
  async execute(interaction) {
    await interaction.deferReply();
    await connectDB();

    const stocks = await Stock.find({ status: "listed" })
      .sort({ marketCap: -1 })
      .limit(10)
      .lean();

    if (stocks.length === 0) {
      return interaction.editReply("📊 아직 상장된 종목이 없습니다.");
    }

    const userIds = stocks.map((s) => s.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    const rankEmojis = ["🥇", "🥈", "🥉"];

    const desc = stocks
      .map((s, i) => {
        const emoji = i < 3 ? rankEmojis[i] : `${i + 1}.`;
        const name = userMap[s.userId.toString()]?.username || "Unknown";
        return `${emoji} **${name}** — ${s.marketCap.toLocaleString()} KRW ${gradeEmoji[s.grade] || ""}`;
      })
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("🏆 시가총액 랭킹")
      .setDescription(desc)
      .setFooter({ text: "People Exchange" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
