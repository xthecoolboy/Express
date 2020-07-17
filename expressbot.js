const Discord = require('discord.js');
const client = new Discord.Client();
const active = new Map();
const pingFrequency = (30 * 1000);
const waitingTime = (10 * 1000);
const fs = require('fs');

const prefix = process.env.PREFIX;
const ownerID = process.env.OWNERID;




client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  if (message.content.toLowerCase().startsWith(prefix + `staffcommands`)) {
    const embed = new Discord.RichEmbed()
    .setTitle(`:mailbox_with_mail: Bot Help`)
    .setColor(0xCF40FA)
    .setDescription(`Hello! I'm from the game community,  Here are my commands:`)
    .addField(`staff commands`, `!clear {number} > does clear the chat\n!kick {@user} > kicks the user\n!warn {@user} > warns a user\n!send {@user} {msessage} > sends a message to a player in dm\n!say_algemeen {message} > sends a message in algemeen\n!say_updates {message} > sends a message in updates\n!say_regels {message} > sends a message in regels\n!say_informatie {message} > sends a message in informatie`)
    message.channel.send({ embed: embed });
  }
  
  if (message.content.toLowerCase().startsWith(prefix + `help`)) {
    const embed = new Discord.RichEmbed()
    .setTitle(`:mailbox_with_mail: Bot Help`)
    .setColor(0xCF40FA)
    .setDescription(`Hello! I'm from the game community,  Here are my commands:`)
    .addField(`Tickets`, `!new > Opens up a new ticket\n!close > Closes a ticket that has been resolved or been opened by accident`)
    .addField(`Fun`, `!options > ...\n!yesno > ...\n!random > ...\n!permissions > ...`)
    .addField(`Commands`, `!suggest {suggestion} > you can post your suggestions for some things\n!yesno > ...\n!random > ...\n!permissions > ...`)
    .addField(`Music`, `>>play > Play the song and feel the music\n>>stop > Stop the music and take rest ;)\n>>drop > Drop The Song From Queue\n>>jump > Jump to any song you like\n>>loop > Loop Your Queue and have fun\n>>lyrics > Get lyrics of the song that you like\n>>np > Get the name of current playing song\n>>pause > Pause the cureent playing Song\n>>ping > Pinging the bot\n>>queue > Get all the song name which are in queue\n>>resume > Resume the Cureent Playing Song\n>>shuffle > Shuffle your queue\n>>skip > Skip the song or shift yourself to next song\n>>volume > Manage the volume of the song`)
    message.channel.send({ embed: embed });
  }

  if (message.content.toLowerCase().startsWith(prefix + `ping`)) {
    message.channel.send(`Hoold on!`).then(m => {
    m.edit(`:ping_pong: Wew, made it over the ~waves~ ! **Pong!**\nMessage edit time is ` + (m.createdTimestamp - message.createdTimestamp) + `ms, Discord API heartbeat is ` + Math.round(client.ping) + `ms.`);
    });
}

if (message.content.toLowerCase().startsWith(prefix + `new`)) {
    const reason = message.content.split(" ").slice(1).join(" ");
    if (!message.guild.roles.exists("name", "『📖』『Support』")) return message.channel.send(`This server doesn't have a \`Support Team\` role made, so the ticket won't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
    if (message.guild.channels.exists("name", "ticket-" + message.author.username)) return message.channel.send(`You already have a ticket open.`);
    message.guild.createChannel(`ticket-${message.author.username}`, "text").then(c => {
        let role = message.guild.roles.find("name", "『📖』『Support』");
        let role2 = message.guild.roles.find("name", "@everyone");
        c.overwritePermissions(role, {
            SEND_MESSAGES: true,
            READ_MESSAGES: true
        });
        c.overwritePermissions(role2, {
            SEND_MESSAGES: false,
            READ_MESSAGES: false
        });
        c.overwritePermissions(message.author, {
            SEND_MESSAGES: true,
            READ_MESSAGES: true
        });
        message.channel.send(`:white_check_mark: Your ticket has been created, #${c.name}.`);
        const embed = new Discord.RichEmbed()
        .setColor(0xCF40FA)
        .addField(`Hey ${message.author.username}!`, `Please try explain why you opened this ticket with as much detail as possible. Our **Support Team** will be here soon to help. <@&719986722766585919>`)
        .setTimestamp();
        c.send({ embed: embed });
    }).catch(console.error);
}
if (message.content.toLowerCase().startsWith(prefix + `close`)) {
    if (!message.channel.name.startsWith(`ticket-`)) return message.channel.send(`You can't use the close command outside of a ticket channel.`);

    message.channel.send(`Are you sure? Once confirmed, you cannot reverse this action!\nTo confirm, type \`-confirm\`. This will time out in 10 seconds and be cancelled.`)
    .then((m) => {
      message.channel.awaitMessages(response => response.content === '-confirm', {
        max: 1,
        time: 10000,
        errors: ['time'],
      })
      .then((collected) => {
          message.channel.delete();
        })
        .catch(() => {
          m.edit('Ticket close timed out, the ticket was not closed.').then(m2 => {
              m2.delete();
          }, 3000);
        });
    });
}

});





client.on("guildCreate", guild => {
	console.log("Joined a new guild: " + guild.name);
	const joinEmbed = new Discord.MessageEmbed()
	.setTitle(guild.name)
	.setThumbnail(guild.iconURL({ dynamic: true }))
	.setDescription(`**${process.env.BOT_NAME}** was invited in **${guild.name}**, hoping that the server owners trust us.`)
	.addField("Server ID", guild.id)
	.setColor('RANDOM');
	client.channels.cache.get("721671873741586503").send(joinEmbed);
});

client.on("guildDelete", guild => {
    console.log("Left a guild: " + guild.name);
});

client.on('message', message => {

	let args = message.content.slice(prefix.length).trim().split(' ');
	let cmd = args.shift().toLowerCase();

	if(message.author.bot) return;
	if(!message.content.startsWith(prefix)) return;

	try {
		let ops = {
			ownerID: ownerID,
            active: active
		}
		let commandFile = require(`./commands/${cmd}.js`);
		commandFile.run(client, message, args, ops);
	} catch (e) {
		console.log(`${message.author.tag} issued command '${prefix}${cmd}', but an error occured executing this command or it doesn't exist`);
		console.log(`Logs: ${e}`);
		message.reply(`An error occurred executing this command or it doesn't exist either. Try reporting this bug with \`${prefix}report bug\``);
	}
});

function getGuildsNumber() {
	client.shard.fetchClientValues('guilds.cache.size')
	.then(results => {
		if(process.env.OBLIVION == 1) return client.user.setActivity(`aiutare la gente, by ImCactus | ${results.reduce((prev, guildCount) => prev + guildCount, 0)} server`);
		return client.user.setActivity(`${prefix}help | ${prefix}invite | ${results.reduce((prev, guildCount) => prev + guildCount, 0)} servers`);
	})
	.catch(console.error);
}

client.on('ready', () => {
	setTimeout(getGuildsNumber, waitingTime)
	client.setInterval(getGuildsNumber, pingFrequency);
});
client.login(process.env.TOKEN);
