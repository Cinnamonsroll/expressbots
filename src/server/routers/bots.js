const { Router } = require("express");
const { checkAuth } = require("../");

module.exports = client => {
  const router = Router();
  let Discord = require("discord.js");
  let model = require("../.././models/bot.js");
  router.get("/", async (req, res) => {
    let bots = await model.find({ approved: true });
    for (let i = 0; i < bots.length; i++) {
      const BotRaw = (await client.users.fetch(bots[i].bot)) || null;
      bots[i].name = BotRaw.username;
      bots[i].avatar = BotRaw.avatar;
    }

    res.render("bots.ejs", { bot: req.bot, user: req.user || null, bots });
  });
  router.post("/:id/genapi", checkAuth, async (req, res) => {
    let id = req.params.id;
    let bot2 = await model.findOne({ bot: id });
    if (!bot2) return res.redirect("/");
    if (!bot2.owners.includes(req.user.id)) return res.redirect("/");
    let data = req.body;
    function genApiKey(options = {}) {
      let length = options.length || 5;
      let string =
        "abcdefghijklmnopqrstuwvxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
      let code = "";
      for (let i = 0; i < length; i++) {
        let random = Math.floor(Math.random() * string.length);
        code += string.charAt(random);
      }
      return code;
    }
    bot2.apiToken = genApiKey({ length: 20 });
    await bot2.save().then(() => {
      res.status(201).json({ token: bot2.apiToken, code: "OK" });
    });
  });
  router.get("/add", checkAuth, async (req, res) => {
    let error;
    let guild = client.guilds.cache.get(client.config.guilds.main);
    let user = req.user;
    let inguild = guild.members.cache.get(req.user.id) ? true : false;
    if (inguild === false) {
      error = {
        html: `<p class="mb-0">You need to join our server to submit a bot. <br>  <a id="invite" href="${client.config.invite}" class="btn btn-sm btn-outline-danger">${client.config.invite}</a></p>`,
        type: "danger"
      };
    }
    String.prototype.toProperCase = function() {
      return this.replace(
        /([^\W_]+[^\s-]*) */g,
        txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    };
    let tags = [
      "leveling",
      "moderation",
      "social",
      "fun",
      "music",
      "game",
      "nsfw",
      "anime",
      "dashboard",
      "logging",
      "economy",
      "verification",
      "youtube",
      "roles",
      "multipurpose",
      "utility",
      "media",
      "memes",
      "roblox",
      "pokemon",
      "giveaway"
    ];
    res.render("addbot.ejs", {
      bot: req.bot,
      user: req.user || null,
      error,
      tags
    });
  });
  router.get("/:id/edit", checkAuth, async (req, res) => {
    let error;
    let guild = client.guilds.cache.get(client.config.guilds.main);
    let user = req.user;
    let inguild = guild.members.cache.get(req.user.id) ? true : false;
    if (inguild === false) {
      error = {
        html: `<p class="mb-0">You need to join our server to submit a bot. <br>  <a id="invite" href="${client.config.invite}" class="btn btn-sm btn-outline-danger">${client.config.invite}</a></p>`,
        type: "danger"
      };
    }
    let id = req.params.id;
    let bot2 = await model.findOne({ bot: id });
    if (!bot2) return res.redirect("/");
    if (!bot2.owners.includes(req.user.id)) return res.redirect("/");
    String.prototype.toProperCase = function() {
      return this.replace(
        /([^\W_]+[^\s-]*) */g,
        txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    };
    let tags = [
      "leveling",
      "moderation",
      "social",
      "fun",
      "music",
      "game",
      "nsfw",
      "anime",
      "dashboard",
      "logging",
      "economy",
      "verification",
      "youtube",
      "roles",
      "multipurpose",
      "utility",
      "media",
      "memes",
      "roblox",
      "pokemon",
      "giveaway"
    ];

    res.render("edit.ejs", {
      bot: req.bot,
      user: req.user || null,
      error,
      userbot: bot2,
      tags
    });
  });
  router.post("/:id/edit", checkAuth, async (req, res) => {
    let id = req.params.id;
    let bot2 = await model.findOne({ bot: id });
    if (!bot2) return res.redirect("/");
    if (!bot2.owners.includes(req.user.id)) return res.redirect("/");
    let data = req.body;
    let guild = client.guilds.cache.get(client.config.guilds.main);
    let user = req.user;
    let bot = (await client.users.fetch(id)) || null;
    bot2.prefix = data.prefix;
    bot2.website = data.website;
    bot2.invite = data.invite;
    bot2.github = data.github;
    bot2.desc = data.description.long;
    bot2.shortDesc = data.description.short;
    bot2.support = data.support;
    bot2.lib = data.libary;
    bot2.tags = data.tags;
    await bot2.save().then(async () => {
      res.status(201).json({ message: "Edited the bot", code: "OK" });
      let logs = guild.channels.cache.get(client.config.channels.logs);
      logs.send(
        `<@${user.id}> edited **${bot.username}#${bot.discriminator}**`
      );
    });
  });
  router.post("/add/submit", checkAuth, async (req, res) => {
    let data = req.body;
    let guild = client.guilds.cache.get(client.config.guilds.main);
    let user = req.user;
    let bot = null;
    try {
      bot = (await client.users.fetch(data.id)) || null;
    } catch (e) {
      return res.status(409).json({ message: "This is not a real bot" });
    }

    if (!bot.bot) return res.status(409).json({ message: "This is not a bot" });
    if (data.onwers) {
      data.owners.forEach(async owner => {
        try {
          await client.users.fetch(owner);
        } catch (e) {
          return res
            .status(409)
            .json({ message: "One of your owners is not a user" });
        }
      });
    }
    let inguild = guild.members.cache.get(req.user.id) ? true : false;
    if (inguild === false) {
      return res
        .status(409)
        .json({ message: "You must join our Discord Server to submit a bot" });
    } else if (await model.findOne({ bot: data.id })) {
      return res
        .status(409)
        .json({ message: "Bot has already been submitted" });
    } else {
      await model
        .create({
          bot: data.id,
          prefix: data.prefix,
          owners: data.owners,
          website: data.website,
          invite: data.invite,
          github: data.github,
          views: 0,
          votes: 0,
          desc: data.description.long,
          uniqueViews: 0,
          support: data.support,
          shortDesc: data.description.short,
          submittedOn: Date.now(),
          lib: data.libary,
          tags: data.tags
        })
        .then(async () => {
          res.status(201).json({ message: "Added to queue", code: "OK" });
          let logs = guild.channels.cache.get(client.config.channels.logs);
          logs.send(
            `<@${user.id}> added **${bot.username}#${bot.discriminator}**`
          );
        });
    }
  });
  router.get("/:id/vote", checkAuth, async (req, res) => {
    let id = req.params.id;
    let bot = await model.findOne({ bot: id });
    if (!bot) return res.redirect("/");
    const BotRaw = (await client.users.fetch(id)) || null;
    let discord_verified = (await BotRaw.fetchFlags()).has("VERIFIED_BOT");

    (bot.verified = discord_verified),
      (bot.name = BotRaw.username),
      (bot.avatar = BotRaw.avatar),
      (bot.status = BotRaw.presence.status);
    res.render("vote.ejs", {
      bot: req.bot,
      user: req.user || null,
      bot2: bot
    });
  });
  router.post("/:id/delete", checkAuth, async (req, res) => {
    let id = req.params.id;
    let bot2 = await model.findOne({ bot: id });
    if (!bot2) return res.redirect("/");
    if (!bot2.owners.includes(req.user.id)) return res.redirect("/");
    let data = req.body;
    let guild = client.guilds.cache.get(client.config.guilds.main);
    let user = req.user;
    let bot = (await client.users.fetch(id)) || null;
    await model.findOneAndDelete({ bot: id }).then(async () => {
      let logs = guild.channels.cache.get(client.config.channels.logs);
      logs.send(
        `**${bot.username}#${bot.discriminator}** was deleted by <@${user.id}>`
      );
      client.guilds.cache
        .get(client.config.guilds.main)
        .members.cache.get(bot.id)
        .kick({ reason: "ur bad kid" });
      res.redirect("/");
    });
  });
  router.post("/:id/vote", checkAuth, async (req, res) => {
    let db = require("quick.db");
    let id = req.params.id;
    let guild = client.guilds.cache.get(client.config.guilds.main);
    let bot = await model.findOne({ bot: id });
    if (!bot)
      return res.json({
        ok: false,
        message: "NO_SUCH_BOT_FOUND",
        reason: "No bot found"
      });
    const OneHour = 60 * 60 * 1000;
    const TwentyFourHour = 24 * OneHour;
    let guild1 = client.guilds.cache.get(id);

    const lastUpvote = (await db.fetch(`votes_${id}_${req.user.id}`)) || null;
    if (lastUpvote) {
      const timeDiff = Date.now() - lastUpvote;
      const remaining = TwentyFourHour - timeDiff;
      if (timeDiff < TwentyFourHour)
        return res.json({ ok: false, message: "REMAINING", remaining });
    }
    db.set(`votes_${id}_${req.user.id}`, Date.now());
    bot.votes = parseInt(bot.votes) + 1;
    await bot.save();
    const BotRaw = (await client.users.fetch(id)) || null;
    let logs = guild.channels.cache.get(client.config.channels.logs);
    logs.send(
      `<@${req.user.id}> voted for **${BotRaw.username}#${BotRaw.discriminator}**`
    );
    return res.json({ ok: true });
  });
  router.get("/:id", async (req, res) => {
    let id = req.params.id;
    let bot = await model.findOne({ bot: id });
    if (!bot) return res.redirect("/");
    bot.views = parseInt(bot.views) + 1;
    await bot.save();
    let db = require("quick.db");
    if (req.user && req.user.id) {
      db.fetch(`${id}_${req.user.id}`) &&
      db.fetch(`${id}_${req.user.id}`) === true
        ? ""
        : await addUniqueView();
      async function addUniqueView() {
        bot.uniqueViews = parseInt(bot.uniqueViews) + 1;
        await bot.save();
        db.set(`${id}_${req.user.id}`, true);
      }
    }
    const BotRaw = (await client.users.fetch(id)) || null;
    let discord_verified = (await BotRaw.fetchFlags()).has("VERIFIED_BOT");

    (bot.verified = discord_verified),
      (bot.name = BotRaw.username),
      (bot.avatar = BotRaw.avatar),
      (bot.status = BotRaw.presence.status);

    res.render("viewbot.ejs", {
      bot: req.bot,
      user: req.user || null,
      bot2: bot
    });
  });
  return router;
};
