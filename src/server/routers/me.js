const { Router } = require("express");
const { checkAuth } = require("../");

module.exports = client => {
  const router = Router();
 
  let Discord = require("discord.js");
  router.get("/", checkAuth, async (req, res) => {
    let model = require("../.././models/bot.js");
 let model2 = require("../.././models/user.js");
    let bio = (await model2.findOne({ user: req.user.id })) || "Not set";
    let bots = await model.find();
    let bots2 = [];
    for (let i = 0; i < bots.length; i++) {
      let botObject = {};
      const BotRaw = (await client.users.fetch(bots[i].bot)) || null;
      botObject.name = BotRaw.username;
      botObject.avatar = BotRaw.avatar;
      botObject.votes = bots[i].votes;
      botObject.id = bots[i].bot;
      botObject.avatar = BotRaw.avatar;
      botObject.tags = bots[i].tags;
      botObject.owners = bots[i].owners;
      if (bots[i].owners.includes(req.user.id)) {
        bots2.push(botObject);
      }
    }

    res.render("me.ejs", { bot: req.bot, user: req.user, bots: bots2, bio: bio.bio });
  });
  router.get("/settings", checkAuth, async (req, res) => {
     let model2 = require("../.././models/user.js");
    let bio = (await model2.findOne({ user: req.user.id })) || "Not set";
    res.render("settings.ejs", { bot: req.bot, user: req.user, bio: bio.bio });
  });
  router.post("/settings/save", checkAuth, async (req, res) => {
    let bio = req.body.bio;
 let model2 = require("../.././models/user.js");
    let data = await model2.findOne({ user: req.user.id });
    if (data) {
      data.bio = bio.toString()
      await data.save().then(async () => {
      
        res.redirect("/me");
      });
    } else {
      await model2
        .create({
          user: req.user.id,
          bio: bio.toString()
        })
        .then(async () => {
       
          res.redirect("/me");
        });
    }
  });

  return router;
};
