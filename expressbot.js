const Discord = require('discord.js');
const client = new Discord.Client();
const active = new Map();
const pingFrequency = (30 * 1000);
const waitingTime = (10 * 1000);
const fs = require('fs');
const request = require('node-superfetch');

const prefix = process.env.PREFIX;
const ownerID = process.env.OWNERID;

    if (msg === PREFIX + "EMBED") {

        console.log(`${sender.tag} requested embed example command`); //This is a little trick I use: it will send a console log everytime someones request the command
        message.reply({ //This will send a embed message: all the embed message documentation can be found on Discord.js official website
            embed: {
                color: 0x0099ff,
                title: 'Discord.js',
                url: 'https://discord.js.org',
                author: {
                    name: 'Dev par itsRems',
                    icon_url: 'https://randomsite.com/your_image_url',
                    url: 'https://itsrems.com',
                },
                description: 'This bot is developed by itsRems using Discord.js',
                thumbnail: {
                    url: 'https://randomsite.com/your_image_url',
                },
                fields: [
                    {
                        name: 'Title field',
                        value: 'Description',
                    },
                    {
                        name: '!embed', 
                        value: 'Shows this message',
                        inline: true, 
                    }
                ],
                image: {
                    url: 'https://randomsite.com/your_image_url',
                },
                timestamp: new Date(),
                footer: {
                    text: "Copyright © itsRems 2018",
                    icon_url: 'https://randomsite.com/your_image_url',
                },
            },
        });
    };


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
