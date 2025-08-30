// /src/app.js
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const middlewares = require('./middlewares');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}))

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Discord Bot API',
    endpoints: {
      sendMessage: 'POST /api/sendmessage',
      health: 'GET /api/health'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// IMPORTANT: Discord message endpoint for Roblox
app.post('/api/sendmessage', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    // Get the Discord client from index.js
    const { client } = require('./index');
    
    // Get data from request
    const { channel_id, other, content } = req.body;
    const message = other || content;
    
    // Validate
    if (!channel_id || !message) {
      return res.status(400).json({ 
        error: 'channel_id and message (other or content) required' 
      });
    }
    
    // Wait a moment for client to be ready if just started
    if (!client.isReady()) {
      console.log('Waiting for Discord client...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Fetch and send to channel
    console.log(`Fetching channel: ${channel_id}`);
    const channel = await client.channels.fetch(channel_id);
    
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    await channel.send(message);
    console.log('Message sent successfully');
    
    // Return success response matching your original format
    res.json({
      message: 'works!',
      success: true
    });
    
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
});

// Error handlers (must be last)
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

process.on('uncaughtException', function (err) {
  console.error(err);
});

module.exports = app;
