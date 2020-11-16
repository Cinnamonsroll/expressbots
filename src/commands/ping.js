const Discord = require("discord.js");
module.exports.run = async (client, message, args) => {
  let start = await message.channel.send("pinging");
  start.edit(
    `Bot ping: \`${start.createdTimestamp -
      message.createdTimestamp}ms\`\nAPI ping: \`${client.ws.ping}ms\``
  );
};
module.exports.help = {
  name: "ping",
  description: "Pings the bot",
  usage: " ",
  owner: false,
  cat: "info",
  aliases: ["ping"]
};
