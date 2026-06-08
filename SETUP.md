# People Exchange — 설치 및 배포 가이드

## 📦 프로젝트 구조

```
people-exchange/
├── src/                  # Next.js 웹앱 (Vercel 배포)
│   ├── app/             # App Router (페이지 + API)
│   │   ├── api/         # API 라우트 (거래, 결제, 관리자)
│   │   ├── admin/       # 관리자 페이지
│   │   ├── stocks/      # 주식 상세 페이지
│   │   └── ...          # 기타 페이지
│   ├── components/      # UI 컴포넌트
│   ├── lib/             # 유틸리티 (DB, Auth, Price)
│   ├── models/          # Mongoose 모델
│   └── types/           # TypeScript 타입
├── bot/                 # Discord.js 봇 (내 PC 실행)
│   └── src/
│       ├── commands/    # 슬래시 커맨드
│       ├── events/      # 이벤트 핸들러 (메시지, 음성)
│       └── models/      # Mongoose 모델
└── vercel.json          # Vercel Cron 설정
```

---

## 🚀 Vercel 배포

### 1. GitHub에 업로드
```bash
cd C:\Users\마크\Desktop\people-exchange
git init
git add .
git commit -m "Initial commit: People Exchange"
# GitHub에서 repo 생성 후:
git remote add origin https://github.com/zero134101/-.git
git push -u origin main
```

### 2. Vercel 프로젝트 생성
1. [vercel.com](https://vercel.com) → Import GitHub Repository
2. Framework: **Next.js**
3. Root Directory: `./` (기본값)
4. Environment Variables 설정:

| 변수명 | 설명 |
|---|---|
| `MONGODB_URI` | MongoDB Atlas 연결 문자열 |
| `DISCORD_CLIENT_ID` | Discord OAuth2 Client ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth2 Client Secret |
| `NEXTAUTH_SECRET` | NextAuth 암호화 키 (랜덤 문자열) |
| `NEXTAUTH_URL` | Vercel 배포 URL (예: https://people-exchange.vercel.app) |
| `CRON_SECRET` | Cron 보안 키 (랜덤 문자열) |

5. Deploy 버튼 클릭

### 3. Vercel Cron 설정
`vercel.json`에 이미 Cron 작업이 정의되어 있습니다:
- **매시간**: 주가 업데이트 (`/api/cron/update-prices`)
- **매일 자정**: 출석 체크 (`/api/cron/daily-attendance`)

Vercel Cron이 작동하려면 **Vercel Pro** 이상 필요합니다.
(무료 플랜에서는 직접 Cron 요청을 보내거나 수동 실행)

---

## 🤖 Discord Bot 설정

### 1. Discord Developer Portal
1. [discord.dev](https://discord.dev) → Applications → New Application
2. Bot → Build-A-Bot → Reset Token → 복사
3. Privileged Gateway Intents: **MESSAGE CONTENT INTENT** ON
4. OAuth2 → General → Client ID 복사
5. OAuth2 → Redirects → `{VERCEL_URL}/api/auth/callback/discord` 추가
6. OAuth2 → URL Generator → `identify` scope → 생성된 URL로 테스트

### 2. 봇 실행
```bash
cd bot
npm install
```

`.env` 파일 생성:
```
DISCORD_BOT_TOKEN=your_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_server_id_here
MONGODB_URI=your_mongodb_uri_here
WEB_URL=https://people-exchange.vercel.app
```

슬래시 커맨드 등록:
```bash
npm run register
```

봇 실행:
```bash
npm start
```

---

## 💻 로컬 개발

```bash
cd C:\Users\마크\Desktop\people-exchange
npm run dev
```

`.env.local` 파일 필요:
```
MONGODB_URI=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

---

## 📋 Discord Bot 명령어

| 명령어 | 설명 |
|---|---|
| `/도움말` | 전체 명령어 확인 |
| `/계좌` | 내 잔고 + 보유 주식 |
| `/주가 @유저` | 현재 주가 조회 |
| `/매수 @유저 수량` | 주식 매수 (수수료 0.5%) |
| `/매도 @유저 수량` | 주식 매도 (수수료 0.5%) |
| `/상장` | 본인 상장 신청 (가입 7일↑) |
| `/배당` | 활동 보상 20% 주주 배당 |
| `/뉴스` | 최신 뉴스 조회 |
| `/순위` | 시가총액 랭킹 |
| `/충전` | KRW 충전 안내 |
| `/출금` | KRW 출금 안내 |
| `/계좌등록` | 출금 계좌 정보 등록 |
