const http = require("http");
const https = require("https");

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
    client.user.setActivity("/도움말 | People Exchange", { type: 3 });

    // Auto-update prices every hour (since Vercel Hobby can't do hourly cron)
    const WEB_URL = process.env.WEB_URL || "http://localhost:3000";
    const BOT_SECRET = process.env.BOT_SECRET || process.env.CRON_SECRET || "";

    async function triggerPriceUpdate() {
      try {
        const url = new URL("/api/trigger/update-prices", WEB_URL);
        const fetcher = url.protocol === "https:" ? https : http;

        await new Promise((resolve, reject) => {
          const req = fetcher.get(
            url.href,
            { headers: { Authorization: `Bearer ${BOT_SECRET}` } },
            (res) => {
              let data = "";
              res.on("data", (chunk) => (data += chunk));
              res.on("end", () => {
                console.log(`📈 Price update: ${data.slice(0, 100)}`);
                resolve();
              });
            }
          );
          req.on("error", reject);
          req.setTimeout(30000, () => { req.destroy(); reject(new Error("timeout")); });
        });
      } catch (err) {
        console.error("❌ Price update failed:", err.message);
      }
    }

    // Run immediately, then every hour
    triggerPriceUpdate();
    setInterval(triggerPriceUpdate, 3600000);
  },
};
