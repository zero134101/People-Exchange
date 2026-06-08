const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { connectDB } = require("../utils/db");
const User = require("../models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("계좌등록")
    .setDescription("출금 받을 계좌 정보를 등록합니다")
    .addStringOption((option) =>
      option.setName("은행").setDescription("은행명 (예: 국민은행)").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("계좌번호").setDescription("계좌번호 (숫자만)").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("예금주").setDescription("예금주명").setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await connectDB();

    const bank = interaction.options.getString("은행");
    const number = interaction.options.getString("계좌번호");
    const holder = interaction.options.getString("예금주");

    await User.findOneAndUpdate(
      { discordId: interaction.user.id },
      {
        $set: {
          bankAccount: { bank, number, holder },
        },
      },
      { upsert: true }
    );

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("✅ 계좌 등록 완료")
      .setDescription("출금 계좌가 등록되었습니다.")
      .addFields(
        { name: "🏦 은행", value: bank, inline: true },
        { name: "📄 계좌번호", value: `****${number.slice(-4)}`, inline: true },
        { name: "👤 예금주", value: holder, inline: true }
      )
      .setFooter({ text: "People Exchange" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
