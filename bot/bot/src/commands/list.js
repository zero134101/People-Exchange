const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { connectDB } = require("../utils/db");
const User = require("../models/User");
const Stock = require("../models/Stock");

const gradeEmoji = {
  bronze: "🟤",
  silver: "⚪",
  gold: "🟡",
  platinum: "⚫",
  diamond: "💎",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("상장")
    .setDescription("본인을 People Exchange에 상장 신청합니다"),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await connectDB();

    let user = await User.findOne({ discordId: interaction.user.id });
    if (!user) {
      user = await User.create({
        discordId: interaction.user.id,
        username: interaction.user.username,
        avatar: interaction.user.displayAvatarURL(),
        krwBalance: 10,
      });
    }

    const daysSinceJoined = (Date.now() - new Date(user.joinedAt).getTime()) / 86400000;
    if (daysSinceJoined < 7) {
      return interaction.editReply("❌ 디스코드 가입 7일 이상만 상장 가능합니다.");
    }

    const existing = await Stock.findOne({ userId: user._id });
    if (existing) {
      if (existing.status === "pending") {
        return interaction.editReply("⏳ 이미 상장 신청했습니다. 관리자 승인을 기다려주세요.");
      }
      if (existing.status === "listed") {
        return interaction.editReply("✅ 이미 상장되어 있습니다.");
      }
      if (existing.status === "rejected") {
        return interaction.editReply("❌ 상장 신청이 거절되었습니다. 관리자에게 문의하세요.");
      }
    }

    await Stock.create({ userId: user._id });

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("✅ 상장 신청 완료")
      .setDescription("관리자 승인 후 상장됩니다. 승인되면 알림을 받게 됩니다.")
      .setFooter({ text: "People Exchange" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
