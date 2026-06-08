const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { connectDB } = require("../utils/db");
const User = require("../models/User");
const Stock = require("../models/Stock");
const Holding = require("../models/Holding");
const Transaction = require("../models/Transaction");

const FEE_RATE = 0.005;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("매도")
    .setDescription("보유한 주식을 매도합니다")
    .addUserOption((option) =>
      option.setName("유저").setDescription("매도할 유저").setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName("수량").setDescription("매도할 주식 수").setRequired(true).setMinValue(1)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    await connectDB();

    const target = interaction.options.getUser("유저");
    const quantity = interaction.options.getInteger("수량");

    const seller = await User.findOne({ discordId: interaction.user.id });
    if (!seller) {
      return interaction.editReply("❌ 계정을 찾을 수 없습니다.");
    }

    const targetUser = await User.findOne({ discordId: target.id });
    if (!targetUser) {
      return interaction.editReply("❌ 해당 유저를 찾을 수 없습니다.");
    }

    const stock = await Stock.findOne({ userId: targetUser._id });
    if (!stock) {
      return interaction.editReply("❌ 해당 유저의 주식 정보를 찾을 수 없습니다.");
    }

    const holding = await Holding.findOne({ userId: seller._id, stockId: stock._id });
    if (!holding || holding.quantity < quantity) {
      return interaction.editReply("❌ 보유 주식이 부족합니다.");
    }

    const price = stock.currentPrice;
    const totalValue = quantity * price;
    const fee = Math.round(totalValue * FEE_RATE);
    const netValue = totalValue - fee;

    holding.quantity -= quantity;
    if (holding.quantity === 0) {
      await Holding.deleteOne({ _id: holding._id });
    } else {
      await holding.save();
    }

    seller.krwBalance += netValue;
    await seller.save();

    await Transaction.create({
      type: "sell",
      userId: seller._id,
      stockId: stock._id,
      amount: quantity,
      price,
      fee,
      status: "completed",
      description: `${target.username} ${quantity}주 매도 (1주당 ${price} KRW)`,
    });

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("✅ 매도 완료")
      .setDescription(`${target.username}의 주식 ${quantity}주를 매도했습니다.`)
      .addFields(
        { name: "💰 매도가", value: `${price.toLocaleString()} KRW`, inline: true },
        { name: "💸 수수료 (0.5%)", value: `${fee.toLocaleString()} KRW`, inline: true },
        { name: "💵 순 수령액", value: `${netValue.toLocaleString()} KRW`, inline: true },
        { name: "🏦 잔고", value: `${seller.krwBalance.toLocaleString()} KRW`, inline: true }
      )
      .setFooter({ text: "People Exchange" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
