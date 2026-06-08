const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { connectDB } = require("../utils/db");
const User = require("../models/User");
const Stock = require("../models/Stock");
const PriceHistory = require("../models/PriceHistory");

const gradeEmoji = {
  bronze: "🟤",
  silver: "⚪",
  gold: "🟡",
  platinum: "⚫",
  diamond: "💎",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("주가")
    .setDescription("특정 유저의 현재 주가를 확인합니다")
    .addUserOption((option) =>
      option.setName("유저").setDescription("확인할 유저").setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    await connectDB();

    const target = interaction.options.getUser("유저");
    const user = await User.findOne({ discordId: target.id });
    if (!user || !user.isListed) {
      return interaction.editReply("❌ 해당 유저는 상장되어 있지 않습니다.");
    }

    const stock = await Stock.findOne({ userId: user._id, status: "listed" });
    if (!stock) {
      return interaction.editReply("❌ 해당 유저의 주식을 찾을 수 없습니다.");
    }

    const recentHistory = await PriceHistory.find({ stockId: stock._id })
      .sort({ recordedAt: -1 })
      .limit(2)
      .lean();

    const change =
      recentHistory.length >= 2
        ? ((stock.currentPrice - recentHistory[1].price) / recentHistory[1].price) * 100
        : 0;

    const embed = new EmbedBuilder()
      .setColor(change >= 0 ? 0x22c55e : 0xef4444)
      .setTitle(`${target.username}의 주식 정보`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        {
          name: "💰 현재가",
          value: `${stock.currentPrice.toLocaleString()} KRW`,
          inline: true,
        },
        {
          name: "📈 등락",
          value: `${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(2)}%`,
          inline: true,
        },
        {
          name: "🏢 시가총액",
          value: `${stock.marketCap.toLocaleString()} KRW`,
          inline: true,
        },
        {
          name: `${gradeEmoji[stock.grade] || ""} 등급`,
          value: stock.grade.toUpperCase(),
          inline: true,
        },
        {
          name: "📊 발행 주식",
          value: `${stock.totalShares.toLocaleString()}주`,
          inline: true,
        },
        {
          name: "📅 상장일",
          value: stock.listedAt
            ? `<t:${Math.floor(new Date(stock.listedAt).getTime() / 1000)}:R>`
            : "Unknown",
          inline: true,
        }
      )
      .setFooter({ text: "People Exchange" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
