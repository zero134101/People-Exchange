const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("충전")
    .setDescription("KRW 충전 방법을 안내합니다"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("💰 KRW 충전 안내")
      .setDescription("아래 계좌로 입금 후 웹사이트에서 입금 신청해주세요.")
      .addFields(
        { name: "🏦 입금 계좌", value: "신한은행 110-123-456789 (PEOPLE EXCHANGE)", inline: false },
        {
          name: "🌐 웹사이트",
          value: `${process.env.WEB_URL || "http://localhost:3000"}/deposit`,
          inline: false,
        },
        {
          name: "💡 안내",
          value: "1 KRW = 100원 입니다.\n입금 확인 후 관리자가 수동으로 충전 처리합니다.",
          inline: false,
        }
      )
      .setFooter({ text: "People Exchange" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
