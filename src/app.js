// /src/app.js
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const middlewares = require('./middlewares');
// const api = require('./api');  // Comment this out or remove it

const app = express();

// app.use(morgan('dev'));
// app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}))

app.get('/', (req, res) => {
  res.json({
    message: 'Discord Bot API'
  });
});

// Simple Discord endpoint directly here
app.post('/api/v1/sendmessage', async (req, res) => {
  // This will be handled by your Discord bot
  res.json({
    message: 'This endpoint needs Discord bot integration'
  });
});

// app.use('/api/v1', api);  // Comment this out or remove it

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

process.on('uncaughtException', function (err) {
  console.error(err);
});

module.exports = app;
