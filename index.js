require('dotenv').config();

const express = require("express");
const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');

const app = express();
const parser = new Parser();

const PORT = process.env.PORT || 3000;
const CHANNEL_ID = process.env.CHANNEL_ID;
const RSS_URL = "https://rss.app/feeds/mnQebQ2anmBwHn2z.xml";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let lastLink = null;

/* ======================
   SERVIDOR WEB (Render)
====================== */

app.get("/", (req, res) => {
  res.send("Bot activo");
});

app.listen(PORT, () => {
  console.log("Servidor web activo en puerto " + PORT);
});

/* ======================
   DISCORD BOT
====================== */

client.once('clientReady', () => {
  console.log(`Bot listo como ${client.user.tag}`);

  // Presencia fija para que no aparezca AFK
  client.user.setPresence({
    activities: [{ name: "RSS Feeds", type: 3 }],
    status: "online"
  });

  setInterval(checkTweets, 30000);
});

async function checkTweets() {
  try {
    const feed = await parser.parseURL(RSS_URL);
    const latest = feed.items[0];

    if (!latest) return;

    if (latest.link !== lastLink) {
      lastLink = latest.link;

      const channel = await client.channels.fetch(CHANNEL_ID);
      await channel.send(`Nuevo tweet sobre filtraciones:\n${latest.link}`);
    }

  } catch (err) {
    console.error("Error RSS:", err.message);
  }
}

client.login(process.env.DISCORD_TOKEN);