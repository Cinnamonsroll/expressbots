module.exports = async (client, message) => {
  let Discord = require("discord.js");
  let prefix = client.config.prefix;
  if (!message.content.toLowerCase().startsWith(prefix)) return;
  if (message.author.bot) return;
  let args = message.content
    .slice(prefix.toLowerCase().length)
    .trim()
    .split(/ +/g);
  let cmd;
  cmd = args.shift().toLowerCase();
  let command;
  if (client.commands.has(cmd)) {
    command = client.commands.get(cmd);
  } else if (client.aliases.has(cmd)) {
    command = client.commands.get(client.aliases.get(cmd));
  }

  try {
    if (
      message.channel
        .permissionsFor(message.guild.me)
        .toArray()
        .includes("SEND_MESSAGES")
    )
      command.run(client, message, args);
  } catch (e) {
    return;
  }
};
