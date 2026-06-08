const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("도움말")
    .setDescription("People Exchange 봇 명령어 목록을 확인합니다"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("📖 People Exchange 명령어")
      .setDescription("디스코드 서버의 활동량 기반 가상 주식 거래소")
      .addFields(
        { name: "💰 /계좌", value: "내 KRW 잔고와 보유 주식 정보 확인", inline: false },
        { name: "📈 /주가 @유저", value: "특정 유저의 현재 주가 확인", inline: false },
        { name: "🟢 /매수 @유저 수량", value: "주식 매수 (수수료 0.5%)", inline: false },
        { name: "🔴 /매도 @유저 수량", value: "주식 매도 (수수료 0.5%)", inline: false },
        { name: "🚀 /상장", value: "본인 상장 신청", inline: false },
        { name: "💸 /배당", value: "활동 보상의 20%를 주주에게 배당", inline: false },
        { name: "📰 /뉴스", value: "최신 뉴스 확인", inline: false },
        { name: "🏆 /순위", value: "시가총액 랭킹 확인", inline: false },
        { name: "💳 /충전", value: "KRW 충전 방법 안내", inline: false },
        { name: "🏦 /출금", value: "KRW 출금 방법 안내", inline: false },
        { name: "📋 /계좌등록", value: "출금 계좌 정보 등록", inline: false }
      )
      .setFooter({ text: "People Exchange — 1 KRW = 100원" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
