module.exports = async (client, member) => {
  let Discord = require("discord.js");
  if (member.guild.id === client.config.guilds.main) {
    let model = require("../models/bot.js");
    let data = await model.findOne({ bot: member.user.id });
    if (data) {
      data.approved = true;
      data.approvedOn = Date.now();
      await data.save();
      member.edit({
        nick: `[ ${data.prefix} ] ${member.user.username}`
      });
      let logs = member.guild.channels.cache.get(client.config.channels.logs);
      logs.send(`<@${member.user.id}> was approved`);
      if (
        client.guilds.cache
          .get(client.config.guilds.testing)
          .members.cache.get(member.user.id)
      ) {
        client.guilds.cache
          .get(client.config.guilds.testing)
          .members.cache.get(member.user.id)
          .kick({ reason: "ur bad kid" });
      }
    }
  }
};
