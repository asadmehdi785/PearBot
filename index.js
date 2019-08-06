// PearBot source code
// Author: Lamb
// Description: PearBot is just a random bot that I made for fun and for learning purposes. It doesn't really have that many
// useful commands, so if you want an actual useful bot then there are other ones out there for you.
// This bot was first created by following CodeLyon's tutorials on YouTube, check this video out to watch the series:
// https://www.youtube.com/watch?v=X_qg0Ut9nU8

// Discord.js is required for the bot to work, pokedex-promise-v2 is a NodeJS package that is a wrapper for PokeAPI v2,
// which is used for the pokemon command.
const Discord = require('discord.js');
const Pokedex = require('pokedex-promise-v2');

// Creating our bot and Pokedex variables
const bot = new Discord.Client();
const P = new Pokedex();

// Private token that should only be seen by the author. Currently the token is taken from a config file that should
// be hidden on Github.
const { token } = require('./config.json');

// PREFIX is the character that is used before each command
// author is me
// version is the current version of the bot, which can be changed
const PREFIX = '!';
const author = "Lamb#3965"
let version = "1.0.0";

// When we run the bot, it should output "This bot is online!" in the terminal.
// This will also set its activity in the member list to be "Playing (whatever)".
bot.on("ready", () => {
	console.log("This bot is online!");
	bot.user.setActivity("Revenge of the Orange");
});

// This code makes it so that the bot sends a message in the first text channel in the server once it is invited into
// the server.
// The code was taken and edited a bit from here:
// https://stackoverflow.com/questions/51447954/sending-a-message-the-first-channel-with-discord-js
bot.on("guildCreate", guild => {
	let channelID;
	let channels = guild.channels;

	for (let c of channels) {
		let channelType = c[1].type;
		if (channelType === "text") {
			channelID = c[0];
			break;
		}
	}

	let channel = bot.channels.get(guild.systemChannelID || channelID);
	channel.send("Thanks for inviting me! Type `!help` to see a list of the current available commands.");
});

// When any message is sent in the chat (I think that's how it works anyways), this function is run.
bot.on("message", message => {
	// If the message is from a bot, we immediately return since we are only concerned with users entering in commands.
	if (message.author.bot) return;

	// If the message starts with our prefix (currently "!") then we run this code.
	if (message.content.startsWith(PREFIX)) {

		// Here are just getting the list of arguments that came after the prefix. For example, if !random 123 is entered,
		// then args[0] would be "random" and args[1] would be 123. Therefore, args is an array that should have at least
		// one item.
		let args = message.content.substring(PREFIX.length).split(" ");

		// Now we will match the command given by args[0] to one of the cases below. If it doesn't match any case, then
		// we go into the default case, in which an error message will be sent in reply to the user.
		switch (args[0]) {
			// If the !help command is entered
			case "help":
				let random_example = "Example: `!random 100`\n> 35";
				let coinflip_example = "Example: `!coinflip`\n> Heads! (or Tails!)";
				let pokemon_example = "Example: `!pokemon pikachu`\n> (some information about Pikachu)";
				let info_example = "Example: `!info`\n> (some information about PearBot)";
				const embed = new Discord.RichEmbed()
					.setTitle("Help")
					.addField("help", "Use `!help` to see this help message.")
					.addField("random", "Try typing `!random` followed by a number \
						to get a random integer from 1 to that number.\n" + random_example)
					.addField("coinflip", "Use `!coinflip` to flip a coin.")
					.addField("pokemon", "Type `!pokemon` followed by a Pok\xE9mon's \
						name to get some information about it.\n" + pokemon_example)
					.addField("info", "Type `!info` to see some general information about PearBot.")
					.addField("Easter Eggs", "There are some easter egg commands as well,\
						but I'm not allowed to tell you them here. Go bother the author about them. :)")
					.setColor(0xF1C40F);
				message.channel.send(embed);
				break;
			// If the !random command is entered
			case "random":
				if (args.length != 2) {
					message.reply("Error! Invalid number of arguments. Please type only a single number after 'random.'");
					break;
				}
				if (isNaN(args[1])) {
					message.reply("Error! Invalid argument. Please type a number after 'random.'");
					break;
				} else {
					let max = args[1];
					let randomNumber = Math.floor((Math.random() * max) + 1);
					message.channel.send(randomNumber);
				}
				break;
			// If the !coinflip command is entered
			case "coinflip":
				let coinflip = Math.floor(Math.random() * 2);
				let result;
				let attachment;

				// The attachments given below should be saved locally.
				if (coinflip === 0) {
					result = "Heads!";
					attachment = new Discord.Attachment("./images/coin_heads.png");
				} else {
					result = "Tails!";
					attachment = new Discord.Attachment("./images/coin_tails.png");
				}
				message.channel.send(result, attachment);
				break;
			// If the !pokemon command is entered. This part uses the pokedex-promise-v2 package.
			case "pokemon":
				if (args.length != 2) {
					message.reply("Error! Invalid number of arguments. Please type a \
						single Pok\xE9mon name after 'pokemon.'");
					break;
				} else {
					// This stuff gets a little bit complicated, but basically we take in the Pokemon's name that the user
					// entered, and we immediately make it into lowercase. That way, even if the user enters something like
					// "PIKACHU" the pokemon  variable will just be equal to "pikachu".
					// The pokedex_number and sprite_url variables are used to get the Pokedex number of the Pokemon as
					// well as the image URL associated with its default front sprite.
					// Once we do P.getPokemonByName(pokemon), we can get that information.
					let pokemon = args[1];
					pokemon = pokemon.toLowerCase();
					let pokedex_number;
					let sprite_url;
					P.getPokemonByName(pokemon).then(function(response) {
						pokedex_number = response.id;
						sprite_url = response.sprites.front_default;
						// To get the Pokedex entry of the Pokemon, we use P.resource(response.species.url). This gives
						// a list of all the Pokedex entries of the Pokemon in all of the games it has been in (I think) in
						// many languages. We only want the latest Pokedex entry in English, so that's what we're doing here.
						P.resource(response.species.url).then(function(response) {
							let entries = response.flavor_text_entries;
							// We loop through every entry that is given.
							for (const entry of entries) {
								let language = entry.language.name;
								// If the language is in English, then we take this one. The first entry is usually the
								// latest one as well, so we can use this.
								if (language === "en") {
									// This is the Pokedex entry
									let flavor_text = entry.flavor_text;
									
									// The entry given by PokeAPI v2 has some newline characters in it, so we remove them
									// as well as any other whitespace characters that might be in there.
									// This was taken from here:
									// https://stackoverflow.com/questions/10805125/how-to-remove-all-line-breaks-from-a-string
									// We probably don't need to be so exhaustive here (we could have just removed \n) but I just
									// left it as is.
									flavor_text = flavor_text.replace(/(\r\n|\n|\r)/gm, " ");

									// Now we take the name of the game from which the Pokedex entry is from. The PokeAPI
									// v2 puts the game version as "ultra-sun", "omega-ruby", etc. so we just rename it so that
									// it looks better once we show it to the user. Thus, "ultra-sun" will become Pokemon
									// Ultra Sun Version, etc. The \xE9 character is used to put an accented e.
									// I don't think the entries should come from any other games than these, because I think
									// almost all Pokemon should be covered here, except for Pokemon like Meltan. I don't
									// believe that Meltan and Melmetal are covered in PokeAPI v2 yet so this should be okay
									// for now.
									let game_version = entry.version.name;
									if (game_version === "ultra-sun") {
										game_version = "Pok\xE9mon Ultra Sun Version";
									} else if (game_version === "ultra-moon") {
										game_version = "Pok\xE9mon Ultra Moon Version";
									} else if (game_version === "omega-ruby") {
										game_version = "Pok\xE9mon Omega Ruby Version";
									} else if (game_version === "alpha-sapphire") {
										game_version = "Pok\xE9mon Alpha Sapphire Version";
									}

									// The Pokemon's name is still lowercase, so we just create a name variable and make
									// it so that the first letter of the Pokemon's name is uppercase.
									// I used the code from here:
									// https://dzone.com/articles/how-to-capitalize-the-first-letter-of-a-string-in
									let firstLetter = pokemon.charAt(0);
									let uppercaseFirstLetter = firstLetter.toUpperCase();
									let stringWithoutFirstLetter = pokemon.slice(1)
									let name = uppercaseFirstLetter + stringWithoutFirstLetter;

									// Now we make our embed using the Pokemon's name, Pokedex number, Pokedex entry,
									// and the game from which the entry was taken from. Again, we are using \xE9 to add
									// the accented e. The thumbnail is set to be the sprite_url we got earlier, and I just
									// set the color to that because I've set the color to all of the embeds to that.
									// It's just the color that was used in the tutorial that I followed (see the top of
									// this file to a link to the first video in that tutorial series by CodeLyon).
									const pokemon_embed = new Discord.RichEmbed()
										.setTitle(name + " Information")
										.addField("Pok\xE9mon Name", name)
										.addField("Pok\xE9dex Number", pokedex_number)
										.addField("Pok\xE9dex Entry", flavor_text)
										.addField("Entry From", game_version)
										.setThumbnail(sprite_url)
										.setColor(0xF1C40F);
									message.channel.send(pokemon_embed);
									break;
								}
							}
						});
					// If there's any problem then this will get logged in the terminal.
					}).catch(function(error) {
						console.log('There was an ERROR: ', error);
						message.reply("please enter a valid Pok\xE9mon name!");
					});
				}
				break;

			// If the !info command is entered.
			case "info":
				const pear_attachment = new Discord.Attachment('./images/pear_transparent.png', 'pear_transparent.png')
				const info_embed = new Discord.RichEmbed()
					.setTitle("Information about PearBot")
					.addField("Version", version)
					.addField("Author", author)
					.attachFile(pear_attachment)
					.setThumbnail("attachment://pear_transparent.png")
					.setColor(0xF1C40F);
				message.channel.send(info_embed).catch(console.error);
				break;
			// These two are the two easter egg commands currently. Right now they are just fun jokes for my friends.
			case "court":
				message.channel.send("Hello *Kourt*ney! :joy:");
				break;
			case "hasan":
				message.channel.send("Hasan says: \"Kevin sucks!\"");
				break;
			default:
				message.reply("Error! Please enter a valid command.");
				break;
		}
	}
});

bot.login(token);
