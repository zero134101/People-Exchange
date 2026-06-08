const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("출금")
    .setDescription("KRW 출금 방법을 안내합니다"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("💸 KRW 출금 안내")
      .setDescription("웹사이트에서 출금 신청해주세요.")
      .addFields(
        {
          name: "🌐 웹사이트",
          value: `${process.env.WEB_URL || "http://localhost:3000"}/withdraw`,
          inline: false,
        },
        {
          name: "📋 출금 절차",
          value:
            "1. 먼저 /계좌등록 명령어로 출금 계좌를 등록합니다.\n2. 웹사이트에서 출금 신청합니다.\n3. 관리자가 확인 후 처리합니다.",
          inline: false,
        }
      )
      .setFooter({ text: "People Exchange" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
