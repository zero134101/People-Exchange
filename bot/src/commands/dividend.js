const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { connectDB } = require("../utils/db");
const User = require("../models/User");
const Stock = require("../models/Stock");
const Holding = require("../models/Holding");
const Transaction = require("../models/Transaction");
const ExchangeRate = require("../models/ExchangeRate");
const News = require("../models/News");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("배당")
    .setDescription("활동 보상의 20%를 주주들에게 배당합니다"),
  async execute(interaction) {
    await interaction.deferReply();
    await connectDB();

    const user = await User.findOne({ discordId: interaction.user.id });
    if (!user || !user.isListed) {
      return interaction.editReply("❌ 상장된 유저만 배당을 지급할 수 있습니다.");
    }

    const stock = await Stock.findOne({ userId: user._id, status: "listed" });
    if (!stock) {
      return interaction.editReply("❌ 주식 정보를 찾을 수 없습니다.");
    }

    const rates = await ExchangeRate.findOne().sort({ createdAt: -1 });
    const dividendRate = rates?.dividendRate || 0.2;

    // Mock activity reward for today (10% of current price)
    const activityReward = Math.round(stock.currentPrice * 0.1);
    const dividendPool = Math.round(activityReward * dividendRate);

    if (dividendPool <= 0) {
      return interaction.editReply("❌ 배당금이 없습니다.");
    }

    const holdings = await Holding.find({ stockId: stock._id });
    const totalShares = holdings.reduce((s, h) => s + h.quantity, 0);

    if (totalShares === 0) {
      return interaction.editReply("❌ 주주가 없습니다.");
    }

    const perShare = Math.floor(dividendPool / totalShares);
    for (const h of holdings) {
      const dividendAmount = perShare * h.quantity;
      if (dividendAmount > 0) {
        const holder = await User.findById(h.userId);
        if (holder) {
          holder.krwBalance += dividendAmount;
          await holder.save();
          await Transaction.create({
            type: "dividend",
            userId: holder._id,
            stockId: stock._id,
            amount: dividendAmount,
            price: 0,
            fee: 0,
            status: "completed",
            description: `${interaction.user.username}의 활동 배당금 ${dividendAmount} KRW`,
          });
        }
      }
    }

    await News.create({
      title: `${interaction.user.username} 배당금 지급`,
      content: `${interaction.user.username}님이 ${dividendPool.toLocaleString()} KRW를 주주들에게 배당했습니다. (1주당 ${perShare} KRW)`,
      type: "general",
      relatedUserIds: [user._id],
    });

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("💸 배당금 지급 완료")
      .setDescription(
        `총 ${dividendPool.toLocaleString()} KRW가 ${holdings.length}명의 주주에게 배당되었습니다.`
      )
      .addFields(
        { name: "활동 보상", value: `${activityReward.toLocaleString()} KRW`, inline: true },
        { name: "배당 비율", value: `${(dividendRate * 100).toFixed(0)}%`, inline: true },
        { name: "1주당 배당", value: `${perShare.toLocaleString()} KRW`, inline: true }
      )
      .setFooter({ text: "People Exchange" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
