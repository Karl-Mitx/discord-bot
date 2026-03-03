require('dotenv').config();

const express = require("express");
const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');
const fs = require("fs");

const app = express();
const parser = new Parser();

const PORT = process.env.PORT || 3000;
const CHANNEL_ID = process.env.CHANNEL_ID;
const RSS_URL = "https://rss.app/feeds/mnQebQ2anmBwHn2z.xml";
const LAST_FILE = "./last.txt";

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

client.once('clientReady', async () => {
  console.log(`Bot listo como ${client.user.tag}`);

  // Presencia fija
  client.user.setPresence({
    activities: [{ name: "RSS Feeds", type: 3 }],
    status: "online"
  });

  // Cargar último link guardado
  if (fs.existsSync(LAST_FILE)) {
    lastLink = fs.readFileSync(LAST_FILE, "utf8");
    console.log("Último link cargado:", lastLink);
  }

  // Ejecutar inmediatamente al iniciar
  await checkTweets();

  // Luego cada 5 minutos
  setInterval(checkTweets, 300000);
});

async function checkTweets() {
  try {
    console.log("Revisando RSS...");

    const feed = await parser.parseURL(RSS_URL);

    if (!feed.items.length) {
      console.log("RSS vacío");
      return;
    }

    const latest = feed.items[0];
    console.log("Último encontrado:", latest.link);

    if (latest.link !== lastLink) {
      console.log("Nuevo tweet detectado");

      lastLink = latest.link;
      fs.writeFileSync(LAST_FILE, lastLink);

      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!channel) {
        console.log("Canal no encontrado");
        return;
      }

      await channel.send(`Nuevo tweet sobre filtraciones:\n${latest.link}`);
      console.log("Tweet enviado correctamente");
    } else {
      console.log("Sin cambios");
    }

  } catch (err) {
    console.error("Error RSS:", err);
  }
}

client.login(process.env.DISCORD_TOKEN);