const Discord = require("discord.js");
module.exports.run = async (client, message, args) => {
  let user = message.mentions.members.first() || message.member;
  let model = require("../models/bot.js");
  let data = await model.find();
  let bots = [];
  for (let i = 0; i < data.length; i++) {
    if (
      data[i].owners
        .filter(o => o !== "")
        .map(o => o.toString())
        .includes(user.id)
    ) {
      bots.push(data[i]);
    }
  }
  if (!bots || bots.length === 0) {
    let embed = new Discord.MessageEmbed()
      .setColor("#2F3136")
      .setTitle(`${user.user.tag}\'s bots`)
      .setDescription(`${user.user.tag} has no bots`);
    message.channel.send(embed);
  } else {
    let embed = new Discord.MessageEmbed()
      .setColor("#2F3136")
      .setTitle(`${user.user.tag}\'s bots`)
      .setDescription(bots.map(bot => `\`${bot.prefix}\` - <@${bot.bot}>`));
    message.channel.send(embed);
  }
};
module.exports.help = {
  name: "bots",
  description: "See how many bots a user has",
  usage: " <user>",
  owner: false,
  cat: "info",
  aliases: ["bots"]
};
