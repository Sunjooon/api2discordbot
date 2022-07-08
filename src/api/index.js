const express = require('express');
const {Client, Intents, TextChannel} = require('discord.js')

const router = express.Router();
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

client.once('ready', () => {
  console.log("ready to use!")
})

router.post('/sendmessage', (req, res) => {
  console.log(req.body)
  client.channels.cache.get(req.body.channel_id).send(req.body.other)
  res.json({
    message: "works!"
  }).status(200)
})

client.login(process.env.DISCORD_BOT)

module.exports = router;

