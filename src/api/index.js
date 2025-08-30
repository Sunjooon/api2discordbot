// bot.js - Main bot file
const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DISCORD_BOT_TOKEN', 'PORT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize Discord client with proper intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  // Optimize caching
  sweepers: {
    messages: {
      interval: 3600, // Every hour
      lifetime: 1800  // 30 minutes
    }
  }
});

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Message sending rate limiter (stricter)
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: 'Message rate limit exceeded'
});

// Bot status
let botReady = false;

// Discord bot events
client.once('ready', () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  botReady = true;
  
  // Set bot status
  client.user.setPresence({
    activities: [{ 
      name: 'with the API', 
      type: ActivityType.Playing 
    }],
    status: 'online'
  });
  
  // Log guild info
  console.log(`Bot is in ${client.guilds.cache.size} guilds`);
});

// Handle Discord errors
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

// Message event handler (example)
client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Simple ping command
  if (message.content.toLowerCase() === '!ping') {
    const latency = Date.now() - message.createdTimestamp;
    await message.reply(`🏓 Pong! Latency: ${latency}ms, API: ${Math.round(client.ws.ping)}ms`);
  }
});

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: botReady ? 'healthy' : 'starting',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    bot: botReady ? {
      username: client.user.username,
      guilds: client.guilds.cache.size,
      ping: client.ws.ping
    } : null
  });
});

// Send message endpoint
app.post('/api/sendmessage', messageLimiter, async (req, res) => {
  try {
    // Validate bot is ready
    if (!botReady) {
      return res.status(503).json({ 
        error: 'Bot is not ready yet' 
      });
    }
    
    // Validate request body
    const { channel_id, content, embed } = req.body;
    
    if (!channel_id) {
      return res.status(400).json({ 
        error: 'channel_id is required' 
      });
    }
    
    if (!content && !embed) {
      return res.status(400).json({ 
        error: 'Either content or embed is required' 
      });
    }
    
    // Get channel
    const channel = await client.channels.fetch(channel_id).catch(() => null);
    
    if (!channel) {
      return res.status(404).json({ 
        error: 'Channel not found' 
      });
    }
    
    if (!channel.isTextBased()) {
      return res.status(400).json({ 
        error: 'Channel is not a text channel' 
      });
    }
    
    // Check bot permissions
    if (channel.guild) {
      const permissions = channel.permissionsFor(client.user);
      if (!permissions.has('SendMessages')) {
        return res.status(403).json({ 
          error: 'Bot lacks permission to send messages in this channel' 
        });
      }
    }
    
    // Prepare message options
    const messageOptions = {};
    
    if (content) {
      messageOptions.content = content.substring(0, 2000); // Discord limit
    }
    
    if (embed) {
      try {
        const embedBuilder = new EmbedBuilder()
          .setColor(embed.color || 0x0099FF)
          .setTitle(embed.title || null)
          .setDescription(embed.description || null)
          .setFooter(embed.footer ? { text: embed.footer } : null)
          .setTimestamp(embed.timestamp ? new Date() : null);
        
        if (embed.fields && Array.isArray(embed.fields)) {
          embed.fields.slice(0, 25).forEach(field => {
            embedBuilder.addFields({
              name: field.name.substring(0, 256),
              value: field.value.substring(0, 1024),
              inline: field.inline || false
            });
          });
        }
        
        messageOptions.embeds = [embedBuilder];
      } catch (embedError) {
        return res.status(400).json({ 
          error: 'Invalid embed format',
          details: embedError.message 
        });
      }
    }
    
    // Send message
    const sentMessage = await channel.send(messageOptions);
    
    res.json({
      success: true,
      messageId: sentMessage.id,
      channelId: sentMessage.channel.id,
      timestamp: sentMessage.createdTimestamp
    });
    
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get bot stats
app.get('/api/stats', (req, res) => {
  if (!botReady) {
    return res.status(503).json({ 
      error: 'Bot is not ready' 
    });
  }
  
  res.json({
    guilds: client.guilds.cache.size,
    channels: client.channels.cache.size,
    users: client.users.cache.size,
    uptime: client.uptime,
    ping: client.ws.ping,
    memory: process.memoryUsage()
  });
});

// Get guild info
app.get('/api/guild/:guildId', async (req, res) => {
  try {
    if (!botReady) {
      return res.status(503).json({ 
        error: 'Bot is not ready' 
      });
    }
    
    const guild = client.guilds.cache.get(req.params.guildId);
    
    if (!guild) {
      return res.status(404).json({ 
        error: 'Guild not found or bot is not a member' 
      });
    }
    
    res.json({
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      channels: guild.channels.cache.size,
      owner: guild.ownerId,
      createdAt: guild.createdAt,
      joined: guild.joinedAt
    });
    
  } catch (error) {
    console.error('Error fetching guild:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  // Close Express server
  server.close(() => {
    console.log('Express server closed');
  });
  
  // Destroy Discord client
  await client.destroy();
  console.log('Discord client disconnected');
  
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
});

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
  console.error('Failed to login to Discord:', error);
  process.exit(1);
});
