const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { connectDB } = require("../utils/db");
const User = require("../models/User");
const Stock = require("../models/Stock");
const Holding = require("../models/Holding");
const Transaction = require("../models/Transaction");

const FEE_RATE = 0.005;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("매수")
    .setDescription("상장된 유저의 주식을 매수합니다")
    .addUserOption((option) =>
      option.setName("유저").setDescription("매수할 유저").setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName("수량").setDescription("매수할 주식 수").setRequired(true).setMinValue(1)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    await connectDB();

    const target = interaction.options.getUser("유저");
    const quantity = interaction.options.getInteger("수량");

    if (target.id === interaction.user.id) {
      return interaction.editReply("❌ 자신의 주식은 매수할 수 없습니다.");
    }

    const buyer = await User.findOne({ discordId: interaction.user.id });
    if (!buyer) {
      return interaction.editReply("❌ 먼저 /계좌 명령어로 계정을 생성해주세요.");
    }

    const targetUser = await User.findOne({ discordId: target.id });
    if (!targetUser || !targetUser.isListed) {
      return interaction.editReply("❌ 해당 유저는 상장되어 있지 않습니다.");
    }

    const stock = await Stock.findOne({ userId: targetUser._id, status: "listed" });
    if (!stock) {
      return interaction.editReply("❌ 해당 유저의 주식을 찾을 수 없습니다.");
    }

    const price = stock.currentPrice;
    const totalCost = quantity * price;
    const fee = Math.round(totalCost * FEE_RATE);
    const totalWithFee = totalCost + fee;

    if (buyer.krwBalance < totalWithFee) {
      return interaction.editReply(
        `❌ 잔액이 부족합니다. 필요: ${totalWithFee.toLocaleString()} KRW (수수료 ${fee.toLocaleString()} KRW 포함), 보유: ${buyer.krwBalance.toLocaleString()} KRW`
      );
    }

    const boughtSoFar = await Holding.aggregate([
      { $match: { stockId: stock._id } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    if ((boughtSoFar[0]?.total || 0) + quantity > stock.totalShares) {
      return interaction.editReply("❌ 발행 주식 수를 초과했습니다.");
    }

    let holding = await Holding.findOne({ userId: buyer._id, stockId: stock._id });
    if (holding) {
      const totalQty = holding.quantity + quantity;
      const totalValue = holding.avgPrice * holding.quantity + price * quantity;
      holding.avgPrice = Math.round(totalValue / totalQty);
      holding.quantity = totalQty;
    } else {
      holding = new Holding({
        userId: buyer._id,
        stockId: stock._id,
        quantity,
        avgPrice: price,
      });
    }
    await holding.save();

    buyer.krwBalance -= totalWithFee;
    await buyer.save();

    await Transaction.create({
      type: "buy",
      userId: buyer._id,
      stockId: stock._id,
      amount: quantity,
      price,
      fee,
      status: "completed",
      description: `${target.username} ${quantity}주 매수 (1주당 ${price} KRW)`,
    });

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("✅ 매수 완료")
      .setDescription(`${target.username}의 주식 ${quantity}주를 매수했습니다.`)
      .addFields(
        { name: "💰 매수가", value: `${price.toLocaleString()} KRW`, inline: true },
        { name: "💸 수수료 (0.5%)", value: `${fee.toLocaleString()} KRW`, inline: true },
        { name: "💵 총 결제액", value: `${totalWithFee.toLocaleString()} KRW`, inline: true },
        { name: "🏦 남은 잔고", value: `${buyer.krwBalance.toLocaleString()} KRW`, inline: true }
      )
      .setFooter({ text: "People Exchange" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
