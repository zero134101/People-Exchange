const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { connectDB } = require("../utils/db");
const User = require("../models/User");
const Holding = require("../models/Holding");
const Stock = require("../models/Stock");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("계좌")
    .setDescription("내 KRW 잔고와 보유 주식 정보를 확인합니다"),
  async execute(interaction) {
    await interaction.deferReply();
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

    const holdings = await Holding.find({ userId: user._id }).populate("stockId");
    const totalInvested = holdings.reduce((s, h) => s + h.avgPrice * h.quantity, 0);

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle(`${interaction.user.username}의 계좌`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: "💰 KRW 잔고", value: `${user.krwBalance.toLocaleString()} KRW`, inline: true },
        { name: "⭐ 명성 점수", value: `${user.reputation.toLocaleString()}`, inline: true },
        { name: "📊 총 투자금액", value: `${totalInvested.toLocaleString()} KRW`, inline: true },
        { name: "📋 보유 종목", value: `${holdings.length}개`, inline: true },
        { name: "📅 가입일", value: `<t:${Math.floor(user.joinedAt.getTime() / 1000)}:R>`, inline: true },
        { name: "🏦 상장 여부", value: user.isListed ? "✅ 상장됨" : "❌ 미상장", inline: true }
      )
      .setFooter({ text: "People Exchange" })
      .setTimestamp();

    if (holdings.length > 0) {
      let desc = holdings
        .slice(0, 5)
        .map((h) => {
          const name = h.stockId?.username || "Unknown";
          return `${name}: ${h.quantity}주 (평균 ${h.avgPrice.toLocaleString()} KRW)`;
        })
        .join("\n");
      if (holdings.length > 5) desc += `\n외 ${holdings.length - 5}개`;
      embed.addFields({ name: "보유 주식", value: desc || "없음" });
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
