const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { connectDB } = require("../utils/db");
const News = require("../models/News");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("뉴스")
    .setDescription("최신 People Exchange 뉴스를 확인합니다"),
  async execute(interaction) {
    await interaction.deferReply();
    await connectDB();

    const newsList = await News.find().sort({ createdAt: -1 }).limit(5).lean();

    if (newsList.length === 0) {
      return interaction.editReply("📰 최신 뉴스가 없습니다.");
    }

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("📰 People Exchange 뉴스")
      .setFooter({ text: "People Exchange" })
      .setTimestamp();

    for (const item of newsList) {
      const emoji =
        item.type === "activity_surge"
          ? "📈"
          : item.type === "inactive"
          ? "📉"
          : item.type === "ipo"
          ? "🚀"
          : "📰";
      embed.addFields({
        name: `${emoji} ${item.title}`,
        value: `${item.content}\n-# <t:${Math.floor(new Date(item.createdAt).getTime() / 1000)}:R>`,
      });
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
