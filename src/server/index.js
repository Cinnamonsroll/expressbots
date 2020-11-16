const path = require("path");
const session = require("express-session");
const express = require("express");
const passport = require("passport");
const SQLiteStore = require("connect-sqlite3")(session);
const { Strategy } = require("passport-discord").Strategy;

module.exports = client =>
  new Promise(resolve => {
    const server = client.server,
      app = client.express;

    app.use(require("express").json());
    app.use(require("express").urlencoded({ extended: false }));
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "pages"));

    /* Authentication */
    bindAuth(app, client);
    let mongoose = require("mongoose");

    mongoose.connect(
      client.config.mongo,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
      },
      () => console.log("Connected to db")
    );
    const BotRouter = require("./routers/bots")(client);
    app.use("/bots", BotRouter);
    const QueueRouter = require("./routers/queue")(client);
    app.use("/queue", QueueRouter);
    const SearchRouter = require("./routers/search")(client);
    app.use("/search", SearchRouter);
   const MeRouter = require("./routers/me")(client);
    app.use("/me", MeRouter);
    const ApiRouter = require("./routers/auth")(client);
    app.use("/api", ApiRouter);
  app.get("/user/:id", checkAuth, async (req,res) => {
    let user = req.params.id
    let rawUser = await client.users.fetch(user)
    if(!rawUser) return res.redirect("/")
 let model = require("../models/bot.js");
    let model2 =require("../models/user.js");
    let bio = (await model2.findOne({ user: user }).bio) || "Not set";
    let bots = await model.find();
    let bots2 = [];
    for (let i = 0; i < bots.length; i++) {
      let botObject = {};
      const BotRaw = (await client.users.fetch(bots[i].bot)) || null;
      botObject.name = BotRaw.username;
      botObject.avatar = BotRaw.avatar;
      botObject.votes = bots[i].votes;
      botObject.id = bots[i].bot;
      botObject.avatar = BotRaw.avatar
      botObject.tags = bots[i].tags
        botObject.owners = bots[i].owners
      if(bots[i].owners.includes(rawUser.id)){
      bots2.push(botObject);
      }
    }
 res.render("user.ejs", { bot: req.bot, user: req.user, bots: bots2, bio, user2: rawUser });
})
    app.get("/", async (req, res) => {
      let model = require("../models/bot.js");
      let bots = await model.find({ approved: true });
      for (let i = 0; i < bots.length; i++) {
        const BotRaw = (await client.users.fetch(bots[i].bot)) || null;
        bots[i].name = BotRaw.username;
        bots[i].avatar = BotRaw.avatar;
      }
      Array.prototype.shuffle = function() {
        let a = this;
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };
      res.render("index.ejs", { bot: req.bot, user: req.user || null, bots: bots.shuffle() });
    });

    server.listen(client.config.port);
    resolve();
  });

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports.checkAuth = checkAuth;

async function checkStaff(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect("/login");
  if (req.user.staff) return next();
  res.redirect("/");
}

module.exports.checkStaff = checkStaff;

function bindAuth(app, client) {
  app.use(
    session({
      store: new SQLiteStore(),
      secret: "expressbotslolllllllllllllllllllllllll",
      resave: false,
      saveUninitialized: false
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use(
    new Strategy(
      {
        clientID: client.config.bot.id,
        clientSecret: client.config.bot.secret,
        callbackURL: client.config.bot.redirect,
        scope: client.config.bot.scopes
      },
      function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
          profile.tokens = { accessToken };
          return done(null, profile);
        });
      }
    )
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/login", (req, res) => {
    res.redirect(
      `https://discord.com/api/oauth2/authorize?client_id=${
        client.config.bot.id
      }&redirect_uri=${encodeURIComponent(
        client.config.bot.redirect
      )}&response_type=code&scope=${encodeURIComponent(
        client.config.bot.scopes.join(" ")
      )}`
    );
  });

  app.get(
    "/auth/callback",
    passport.authenticate("discord", {
      failureRedirect: "/"
    }),
    (req, res) => res.redirect("/")
  );

  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  app.use(async (req, res, next) => {
    req.bot = client;
    let guild = client.guilds.cache.get(client.config.guilds.main);
    if (!guild) {
      guild = client.guilds.cache.get("777195219732922409");
    }
    let user = req.user ? guild.members.cache.get(req.user.id) : "";
    let isStaff;
    if (user) {
      if (user.roles.cache.has(client.config.roles.bottester)) {
        isStaff = true;
      } else {
        isStaff = false;
      }
    } else {
      isStaff = false;
    }

    if (req.user) {
      if (isStaff) req.user.staff = true;
      else req.user.staff = false;
    }
    next();
  });
}
