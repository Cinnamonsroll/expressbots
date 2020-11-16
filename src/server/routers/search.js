const { Router } = require("express");
const { checkAuth } = require("../");

module.exports = client => {
  const router = Router();
  let model = require("../.././models/bot.js");

  router.get("/", async (req, res) => {
    const search = req.query.q;
    if (!search) return res.redirect("/");

    let model = require("../.././models/bot.js");
    let bots = await model.find({ approved: true });
    let bots2 = [];
    for (let i = 0; i < bots.length; i++) {
      const BotRaw = (await client.users.fetch(bots[i].bot)) || null;
      bots[i].name = BotRaw.username;
      bots[i].avatar = BotRaw.avatar;
      if (bots[i].tags.map(t => t.toLowerCase()).includes(search) || BotRaw.username.toLowerCase().includes(search) || bots[i].lib.toLowerCase().includes(search)) {
        bots2.push(bots[i]);
      }
    }

    res.render("search.ejs", {
      bot: req.bot,
      bots: bots2,
      user: req.user || null,
      search
    });
  });
  router.get("/api", async (req, res) => {
    const search = req.query.q;
    if (!search) return res.json({ error: "No query defined." });

    let model = require("../.././models/bot.js");
    let bots = await model.find({ approved: true });
    let bots2 = [];
    for (let i = 0; i < bots.length; i++) {
      let botobject = {};
      const BotRaw = (await client.users.fetch(bots[i].bot)) || null;
      botobject.name = BotRaw.username;
      botobject.avatar = BotRaw.avatar;
      botobject.bot = BotRaw.id;
      if (bots[i].tags.map(t => t.toLowerCase()).includes(search) || BotRaw.username.toLowerCase().includes(search) || bots[i].lib.toLowerCase().includes(search)) {
        bots2.push(botobject);
      }
    }
    return res.json({ bots: bots2 });
  });

  return router;
};
