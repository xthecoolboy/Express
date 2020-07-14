const Discord = require('discord.js');
const { Client, RichEmbed, Attachment } = Discord;
const client = new Client({ disableEveryone: true });
const { TOKEN, PREFIX } = require('./config.js');
const Enmap = require('enmap');
const bldb = new Enmap({ name: 'bldb' });

client.on('ready', () => {

	console.log(`Logged in as ${client.user.username}!`);
	client.user.setActivity('something', { type: 'WATCHING' });

});

client.on('message', async message => {

	const key = `${message.guild.id-message.author.id}`;
	const prefix = PREFIX;
	const args = message.content.slice(prefix.length).trim().split(/\s+/g);
	const command = args.shift().toLowerCase();
	if(!message.content.startsWith(prefix) || message.author.bot) return;


	if(command === 'ping') { // a simple ping-pong command.

		message.channel.send('Hoold on!').then(m => {

			m.edit('🏓  ::  **Pong!** (Roundtrip took: **' + (m.createdTimestamp - message.createdTimestamp) + 'ms.** Heartbeat: **' + Math.round(client.ping) + 'ms.**)');

		});

	}


	if(['blacklist', 'b', 'bl'].includes(command)) {

		if(!message.member.hasPermission('ADMINISTRATOR')) return err('You don\'t have enough permissions to do that!');

		bldb.ensure('blusers', []);

		if (bldb.get('blusers').some(data => data.includes(key))) return err('This member is already blacklisted!');
		const member = message.mentions.members.first();
		if(!member) return err('You didn\'t mention a valid member or the member doesen\'t exist in this server.');
		const keyy = `${message.guild.id - member.id}`;

		bldb.push('blusers', keyy);

		sendEmbed(`:white_check_mark: Blacklisted **${member.user.tag}** (${member.user.id})!`);


	}


	if(['unblacklist', 'ub', 'ubl'].includes(command)) {

		if(!message.member.hasPermission('ADMINISTRATOR')) return err('You don\'t have enough permissions to do that!');

		bldb.ensure('blusers', []);

		if (!bldb.get('blusers').some(data => data.includes(key))) return message.channel.send('This member is not blacklisted!');
		const member = message.mentions.members.first();
		if(!member) return err('You didn\'t mention a valid member or the member doesen\'t exist in this server.');
		const blUsers = bldb.get('blusers');
		const index = blUsers.indexOf(key);
		if (index > -1) {
			blUsers.splice(index, 1);

			bldb.set('blusers', blUsers);

			sendEmbed(`:white_check_mark: Unblacklisted **${member.user.tag}** (${member.user.id})!`);

		}

	}


	if (command === 'new') {

		bldb.ensure('blusers', []);

	 if (bldb.get('blusers').some(data => data.includes(key))) return err('You are blacklisted!');

		const reason = message.content.split(' ').slice(1).join(' ');
		if(!reason) return message.channel.send('You didn\'t give me a reason to open the ticket.');
		if (!message.guild.roles.find(c => c.name === 'Support Team')) return err('This server doesn\'t have a `Support Team` role made, so the ticket won\'t be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets. Also must give the role permission to `Allow anyone to mention the role`.');
		if (message.guild.channels.find(c => c.name === 'ticket-' + message.author.id)) return err('You already have a ticket open.');
		if(message.guild.channels.some(c => /ticket-[0-9]{18,20}/.test(c.name))) return err('This server already has a ticket open. until that you can\'t open another.');
		message.guild.createChannel(`ticket-${message.author.id}`, 'text').then(c => {
  	const role = message.guild.roles.find(r => r.name === 'Support Team');
		 const role2 = message.guild.defaultRole;

			c.overwritePermissions(role, {

				SEND_MESSAGES: true,
				READ_MESSAGES: true,

			});

			c.overwritePermissions(role2, {

				SEND_MESSAGES: false,
				READ_MESSAGES: false,

			});

			c.overwritePermissions(message.author, {

				SEND_MESSAGES: true,
				READ_MESSAGES: true,

			});

			sendEmbed(`:white_check_mark: Your ticket has been created, ${c}.`, false);

			const embed = new RichEmbed()

				.setColor('RANDOM')
				.addField(`Hey ${message.author.username}!`, 'Please try explain why you opened this ticket with as much detail as possible. Our **Support Team** will be here soon to help.')
				.addField('Reason', reason)
				.addField('Opened By:', `${message.author.tag}`)
				.setTimestamp();

			c.send({ embed: embed });
			c.send(`${role} | <@${message.author.id}>`);

		}).catch(console.error);


	}


  	if (command === 'add') {

		const member = message.mentions.members.first();
		if(!member) return err('You didn\'t mention a vaild user or the user dosen\'t exist in this guild');
		if (!message.channel.name.startsWith('ticket-')) return err('You can\'t add a member outside of a ticket channel.');

		message.channel.overwritePermissions(member, {

			SEND_MESSAGES: true,
			READ_MESSAGES: true,

		});

		sendEmbed(`:white_check_mark: **${member.user.tag}** (${member.user.id}) has been added to the ticket.`);

	}


	if (command === 'close') {

		if (!message.channel.name.startsWith('ticket-')) return err('You can\'t use the `close` command outside of a ticket channel.');
		const reason = message.content.split(' ').slice(1).join(' ');
		if(!reason) return err('You didn\'t give me a reason to close the ticket.');
		let createdBy = message.channel.name.replace('ticket-', '');
		createdBy = client.users.get(createdBy);

		message.channel.send('Are you sure? Once confirmed, you cannot reverse this action!\nTo confirm, type `-confirm`. This will time out in 10 seconds and be cancelled.')

			.then(m => {

				message.channel.awaitMessages(response => response.content === '-confirm', {

					max: 1,

					time: 10000,

					errors: ['time'],

				})

					.then(async collected => {

						message.channel.fetchMessages({ limit:100 }).then(async fetched => {

							fetched = fetched.array().reverse();
							const mapped = fetched.map(msg => `${msg.author.tag}: ${msg.content}`).join('\n');
							const att = new Attachment(Buffer.from(mapped), 'transcript.txt');

							const embed = new RichEmbed()

						  	        .setColor('RANDOM')
								.setTitle('Your ticket has been closed!')
								.addField('Closed By:', message.author.tag)
								.addField('Reason:', reason)
								.setDescription('But don\'t worry! Here\'s your transcript: **(Note: This can only show 100 messages maximum as the Discord API limit. If there were more, It may not be able to show them.)**');

							createdBy.send(embed);
							createdBy.send(att);

							let logc = message.guild.channels.find(c => c.name === 'ticket-log');
							if(!logc) logc = await message.guild.createChannel('ticket-log', 'text');

							const closedEmbed = new RichEmbed()

								.setColor('RANDOM')
								.setTitle('Ticket Closed!')
								.addField('Created By:', createdBy.tag)
								.addField('Closed By:', message.author.tag)
								.addField('Reason:', reason);

							await logc.send(closedEmbed);


						});

						message.channel.delete();

					})

					.catch(() => {

						m.edit('Ticket close timed out, the ticket was not closed.').then(m2 => {

							m2.delete(5000);

						}, 3000);

					});

			});

	}


	if(command === 'transcript') {

		if(!message.channel.name.startsWith('ticket-')) return err('You can\'t use the `transcript` command outside of a ticket channel.');

		message.channel.fetchMessages({ limit:100 }).then(async fetched => {

			fetched = fetched.array().reverse();
			const mapped = fetched.map(msg => `${msg.author.tag}: ${msg.content}`).join('\n');
			const att = new Attachment(Buffer.from(mapped), 'transcript.txt');

			message.channel.send(att);
		});

	}


	/* The functions are just for making the work simple and easy for you, you can use it if you want. or, remove it.*/


	function sendEmbed(text, sendEmbedToAuthor) { // This function does what actually is just send an embed to this channel or send an embed to this author who executed the command.
		const embed = new RichEmbed()
			.setDescription(text)
			.setColor('RANDOM');
		if (sendEmbedToAuthor) {
			return message.author.send(embed);
		}
		else {
			return message.channel.send(embed);
		}
	}

	function send(text, sendToAuthor) { // This function does what actually is just send a message to this channel or send a message to this author who executed the command.
		if(sendToAuthor) {
			return message.author.send(text);
		}
		else {
			return message.channel.send(text);

		}

	}

	function err(text) { // This basically sends an error embed. you need to check the error and send the embed.
		const embed = new RichEmbed()
			.setTitle('Error!')
			.setDescription(text)
			.setColor(0xFF0000);
		return message.channel.send(embed);

	}


});

client.login(TOKEN);
