const { Router } = require("express");
const { checkAuth } = require("../");

module.exports = client => {
  const router = Router();
  let Discord = require("discord.js");
  router.post("/stats",  async (req, res) => {
    let model = require("../.././models/bot.js");
    let authtoken = req.headers.auth;
    if (!authtoken) return res.json({ error: "Please include a api token" });
    let data = await model.findOne({ apiToken: authtoken });
    if (!data) return res.json({ error: "Invalid api token" });
    let servers = req.body.guilds;
    if (!servers) return res.json({ error: "Please include server count" });
    if (isNaN(servers))
      return res.json({ error: "Please include valid server count" });
    if (servers <= 0)
      return res.json({ error: "Please include valid server count" });
    data.servers = servers;
    await data.save();
    return res.json({ success: true, message: data });
  });

  return router;
};
