module.exports.run = async (client, message, args) => {
  let Discord  = require("discord.js")
  if(!message.member.roles.cache.has(client.config.roles.bottester) || message.guild.id !== client.config.guilds.main) return message.reply("You can not use this command")
let { inspect } = require("util");
    const embed = new Discord.MessageEmbed().setFooter(
      message.author.username,
      message.author.avatarURL()
    );
    const query = args.join(" ");
    if (query) {
      const code = (lang, code) =>
        `\`\`\`${lang}\n${String(code).slice(0, 1000) +
          (code.length >= 1000 ? "..." : "")}\n\`\`\``.replace(
          client.token,
          "#".repeat(client.token.length)
        );
      try {
        const evald = await eval(query);

        const res =
          typeof evald === "string" ? evald : inspect(evald, { depth: 0 });
        embed
          .addField("Result", code("js", res))
          .addField(
            "Type",
            code("css", typeof evald === "undefined" ? "Unknown" : typeof evald)
          )
          .setColor("#F5FAFA");
      } catch (err) {
        embed.addField("Error", code("js", err)).setColor("#F5FAFA");
      } finally {
        message.channel.send(embed).catch(err => {
          message.channel.send(
            `There was an error while displaying the eval result! ${err.message}`
          );
        });
      }
    } else {
      message.channel.send("Please, write something so I can evaluate!");
    }
}
module.exports.help = {
  name: "eval",
  description: "Evals code",
  usage: " code",
  owner: false,
  cat: "owner",
  aliases: ["e"]
};
