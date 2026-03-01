const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot activo");
});

app.listen(3000, () => {
  console.log("Servidor web activo");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');
const parser = new Parser();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const CHANNEL_ID = process.env.CHANNEL_ID;
const RSS_URL = "https://rss.app/feeds/mnQebQ2anmBwHn2z.xml"; // RSS URL DE JORGE MOST

let lastLink = null;

client.once('clientReady', () => {
  console.log(`Bot listo como ${client.user.tag}`);

  setInterval(checkTweets, 30000); // cada 60 segundos
});

async function checkTweets() {
  try {
    const feed = await parser.parseURL(RSS_URL);
    const latest = feed.items[0];

    if (!latest) return;

    if (latest.link !== lastLink) {
      lastLink = latest.link;

      const channel = await client.channels.fetch(CHANNEL_ID);
      channel.send(`Nuevo tweet sobre filtraciones:\n${latest.link}`);
    }

  } catch (err) {
    console.error("Error:", err);
  }
}

client.login(process.env.DISCORD_TOKEN);