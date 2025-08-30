// /src/index.js - With Debug Logging
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
require('dotenv').config();

console.log('=================================');
console.log('🚀 Starting Discord Bot...');
console.log('=================================');

// Debug: Check environment variables
console.log('📋 Environment Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT || 3000);
console.log('- Token exists:', !!process.env.DISCORD_BOT_TOKEN);
console.log('- Token length:', process.env.DISCORD_BOT_TOKEN?.length);
console.log('- Token preview:', process.env.DISCORD_BOT_TOKEN?.substring(0, 20) + '...');

// Initialize Discord client with debug
console.log('📡 Initializing Discord client...');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Track bot state
let botReady = false;
let loginAttempted = false;
let loginError = null;

// Discord event handlers with debug
client.once('ready', () => {
  console.log('=================================');
  console.log('✅ DISCORD BOT IS ONLINE!');
  console.log(`📌 Bot Username: ${client.user.tag}`);
  console.log(`📌 Bot ID: ${client.user.id}`);
  console.log(`📌 Guilds: ${client.guilds.cache.size}`);
  console.log('=================================');
  botReady = true;
  
  // Set presence
  client.user.setPresence({
    status: 'online',
    activities: [{
      name: 'Debug Mode',
      type: 0
    }]
  });
});

// Error handlers
client.on('error', (error) => {
  console.error('❌ Discord Client Error:', error);
  loginError = error.message;
});

client.on('warn', (warning) => {
  console.warn('⚠️ Discord Warning:', warning);
});

client.on('disconnect', () => {
  console.log('🔌 Bot disconnected from Discord');
  botReady = false;
});

client.on('reconnecting', () => {
  console.log('🔄 Bot reconnecting to Discord...');
});

// Initialize Express
console.log('🌐 Initializing Express server...');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Debug endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    debug: {
      botReady: botReady,
      loginAttempted: loginAttempted,
      loginError: loginError,
      tokenExists: !!process.env.DISCORD_BOT_TOKEN,
      tokenLength: process.env.DISCORD_BOT_TOKEN?.length,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: botReady ? 'healthy' : 'starting',
    botReady: botReady,
    loginError: loginError,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Send message endpoint
app.post('/api/sendmessage', async (req, res) => {
  console.log('📨 Received sendmessage request:', req.body);
  
  try {
    if (!botReady) {
      console.log('❌ Bot not ready for sending messages');
      return res.status(503).json({ 
        error: 'Bot not ready',
        loginError: loginError 
      });
    }
    
    const { channel_id, content, other } = req.body;
    const message = content || other;
    
    if (!channel_id || !message) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'channel_id and message required' 
      });
    }
    
    console.log(`📤 Fetching channel: ${channel_id}`);
    const channel = await client.channels.fetch(channel_id);
    
    if (!channel) {
      console.log('❌ Channel not found');
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    console.log(`📤 Sending message to channel: ${channel.name || channel_id}`);
    await channel.send(message);
    
    console.log('✅ Message sent successfully');
    res.json({
      success: true,
      message: 'Message sent!'
    });
    
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Debug info endpoint
app.get('/api/debug', (req, res) => {
  const debugInfo = {
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    },
    discord: {
      botReady: botReady,
      loginAttempted: loginAttempted,
      loginError: loginError,
      tokenExists: !!process.env.DISCORD_BOT_TOKEN,
      tokenLength: process.env.DISCORD_BOT_TOKEN?.length,
      tokenPreview: process.env.DISCORD_BOT_TOKEN ? 
        process.env.DISCORD_BOT_TOKEN.substring(0, 10) + '...' : 'NO TOKEN'
    },
    client: botReady ? {
      username: client.user?.tag,
      id: client.user?.id,
      guilds: client.guilds.cache.size,
      channels: client.channels.cache.size,
      ping: client.ws.ping
    } : null
  };
  
  console.log('📊 Debug info requested:', debugInfo);
  res.json(debugInfo);
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`✅ Express server running on port ${PORT}`);
  console.log(`📌 Local URL: http://localhost:${PORT}`);
});

// Attempt Discord login
console.log('🔐 Attempting Discord login...');
loginAttempted = true;

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is not set!');
  loginError = 'No token provided';
} else {
  client.login(process.env.DISCORD_BOT_TOKEN)
    .then(() => {
      console.log('✅ Discord login promise resolved');
    })
    .catch(error => {
      console.error('❌ Discord login failed!');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      loginError = error.message;
      
      // Common error explanations
      if (error.message.includes('TOKEN_INVALID')) {
        console.error('💡 The bot token is invalid. Please check:');
        console.error('   1. Token is correctly copied from Discord Developer Portal');
        console.error('   2. No extra spaces or characters');
        console.error('   3. Token hasn\'t been regenerated');
      } else if (error.message.includes('DISALLOWED_INTENTS')) {
        console.error('💡 Missing required intents. Please enable in Discord Developer Portal:');
        console.error('   1. Go to your application → Bot section');
        console.error('   2. Enable MESSAGE CONTENT INTENT');
        console.error('   3. Enable SERVER MEMBERS INTENT');
      }
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Express server closed');
  });
  client.destroy();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('📋 Initialization complete, waiting for events...');
