// /src/index.js - Simple working version
const app = require('./app');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// ADD DISCORD BOT CODE
console.log('Starting Discord bot...');
console.log('Token exists:', !!process.env.DISCORD_BOT_TOKEN);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log('✅ Discord bot is online!');
  console.log('Bot username:', client.user.tag);
});

client.on('error', (error) => {
  console.error('Discord error:', error);
});

// Login to Discord
if (process.env.DISCORD_BOT_TOKEN) {
  client.login(process.env.DISCORD_BOT_TOKEN)
    .then(() => console.log('Discord login successful'))
    .catch(err => console.error('Discord login failed:', err.message));
} else {
  console.error('❌ DISCORD_BOT_TOKEN not found!');
}

// START EXPRESS SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening: http://localhost:${PORT}`);
});

// Export client so app.js can use it if needed
module.exports = { client };
