const express = require('express');
const {Client, Intents, TextChannel} = require('discord.js')

const router = express.Router();
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

client.once('ready', () => {
  console.log("ready to use!")
})

router.post('/sendmessage', (req, res) => {
  new Promise((resolve, reject) => {
    client.channels.cache.get(req.body.channel_id).send(req.body.other)
    res.json({
      message: "works!"
    }).status(200)
    resolve()
  }).then(() => {
    console.log("sent msg")
  }).catch((err) => {
    console.log({msg: err})
  })

})

client.login(process.env.DISCORD_BOT)

module.exports = router;

