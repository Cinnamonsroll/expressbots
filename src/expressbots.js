const { Client, Collection } = require("discord.js");
const fs = require("fs");

module.exports = class expressbot extends Client {
  constructor(...options) {
    super(...options);

    this.express = require("express")(); /* Express Server */
    this.server = require("http").Server(this.express); /* HTTP Server */
    this.commands = new Collection();
    this.aliases = new Collection();
    this.config = require("yaml").parse(
      fs.readFileSync(__dirname + "/config.yaml", "utf8")
    );
    this.token = this.config.token;
  }

  load() {
    return new Promise(resolve => {
      fs.readdir(__dirname + "/events/", (err, files) => {
        if (err) console.log(err);

        let jsfile1 = files.filter(f => f.split(".").pop() === "js");
        if (jsfile1.length <= 0) {
          console.log("Could not find any events");
          return;
        }
        jsfile1.forEach(f => {
          const eventName = f.split(".")[0];
          console.log(`Loading Event: ${eventName}`);
          const event = require(`./events/${f}`);

          this.on(eventName, event.bind(null, this));
        });
      });

      fs.readdir(__dirname + "/commands/", (err, files) => {
        if (err) console.log(err);

        let jsfile = files.filter(f => f.split(".").pop() === "js");
        if (jsfile.length <= 0) {
          console.log("Could not find any commands");
          return;
        }
        jsfile.forEach(f => {
          let props = require(`./commands/${f}`);
          console.log(`${f} loaded!`);
          this.commands.set(props.help.name, props);
          props.help.aliases.forEach(alias => {
            this.aliases.set(alias, props.help.name);
          });
        });
      });

      /* Server */
      require("./server")(this).then(() =>
        console.log(`Listening on PORT ${this.config.port} (Server)`)
      );

      return resolve();
    });
  }

  connect() {
    return this.login(this.token);
  }
};
