const { Router } = require("express");
const { checkAuth } = require("../");

module.exports = client => {
  const router = Router();
  let Discord = require("discord.js");
  router.get("/", checkAuth, async (req, res) => {
    if (!req.user.staff) return res.redirect("/");
    let model = require("../.././models/bot.js");
    let bots = await model.find({approved: false});
    let queue = [];
    for (let i = 0; i < bots.length; i++) {
      const queueBotRaw = (await client.users.fetch(bots[i].bot)) || null;
      bots[i].avatar = queueBotRaw.avatar;
      bots[i].tag = `${queueBotRaw.username}#${queueBotRaw.discriminator}`;
      queue.push(bots[i]);
    }
    res.render("queue.ejs", { bot: req.bot, user: req.user, queue });
  });
  router.post("/deny/:id", checkAuth, async (req,res) => {
     let guild = client.guilds.cache.get(client.config.guilds.main);
    if(!id)  return res.redirect("/")
    let id = req.pararms.id
     if (!req.user.staff) return res.redirect("/");
    let model = require("../.././models/bot.js");
    let bot = model.findOne({bot: id})
    if(!bot) return res.redirect("/")
       let logs = guild.channels.cache.get(client.config.channels.logs);
          logs.send(
            `<@${id}> was denyed `
          );
    if(client.guilds.cache.get(client.config.guilds.testing).members.cache.get(id)){
    client.guilds.cache.get(client.config.guilds.testing).members.cache.get(id).kick({reason: "ur bad kid"})
    }
    model.findOneAndDelete({bot: id})
  res.redirect("/queue")
  })
  return router;
};
