const { MessageEmbed } = require("discord.js");
module.exports = {
  name: "say",
  aliases: ["bc", "broadcast"],
  execute(message, args, client) {
    const embed = new MessageEmbed()
      .setTitle(message.author.username)
      .setColor(client.colors.blue)
      .setFooter("Created By Bumpy")
      .setThumbnail(message.author.avatarURL())
      .setDescription(args.join(" "));
    message.channel.send(embed);
  },
};
