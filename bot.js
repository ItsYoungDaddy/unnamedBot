const cmdhandler = require('./commandhandler.js');
const commands = require('./commands.js');
const lumber = require('./lumber.js');
const dbCommands = require('./databaseCommands.js');
const database = require('./database.js')

const Discord = require('./discord.js');

const mineflayer = require('mineflayer');
const pathfinder = require('mineflayer-pathfinder').pathfinder
const gameplay = require('./prismarine-gameplay').gameplay
const mineflayerViewer = require('prismarine-viewer').mineflayer

if (process.argv.length < 3 || process.argv.length > 6) {
    console.log("Usage: node bot.js <host> <port> [<name>] [<password>]");
    process.exit(1);
}
options = {
		username: process.argv[4] ? process.argv[4] : "treeFucker",
		verbose: true,
		port: parseInt(process.argv[3]),
		host: process.argv[2],
		password: process.argv[5],
		version: "1.12.2",
		checkTimeoutInterval: 99999
}


function relog(log=true) {
	if (log) {
		Discord.sendMessage('> Timing out (30 seconds), trying to reconnect...');
		console.log("Attempting to reconnect...");		
	}
	database.init('localhost', 'root', '79397939', 'textlog', 'minedata')
	bot = mineflayer.createBot(options);
	bindEvents(bot);
	bindLogging(bot);
	dbCommands.bindDatabaseShit(bot);
	Discord.bindDiscord(bot)
	// bindGameplay(bot);
	// lumber.bindLumber(bot);
}

lastTimeUsed = 0;
lastTimeMessage = 0;

process.on('uncaughtException', function(err) {
	console.log(err);
	Discord.sendMessage(`<@!437208440578768908> wake up bot has crashed for some reason`);
});

function bindGameplay(bot) {
	bot.loadPlugin(pathfinder);
	bot.loadPlugin(gameplay);
}

function bindLogging(bot) {
	bot.on('message', function(jsonMsg) {
		message = String(jsonMsg);
		lastTimeMessage = Date.now();
		username = message.slice(0, message.indexOf(':'));
		text = message.slice(message.indexOf(':') + 2);


		time = new Date();
		console.log('[' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + '] ' + jsonMsg)
	})

	exports.sendMessage = function(text) {
		bot.chat(text);
	}

	exports.getPlayers = function() {
		return bot.players;
	}
}

function bindEvents(bot) {
	bot.on('chat', function(username, message) {
	    if (username === bot.username) return;

	    if (message[0] == '?') {
		  	if (Date.now() - lastTimeUsed <= 500) return;
		  	lastTimeUsed = Date.now();

		  	//try {
		  		toSend = cmdhandler.commandHandler(username, message);
		  		if (toSend !== null) {
		  			bot.chat(toSend);  		  			
		  		}
		  	//} catch(Exception) {
		  	//	console.log('bruh I almost crashed');
		  	//}

	    } else {
	  	    cmdhandler.messageHandler(username, message);
	  	}
	});

	bot.on('kicked', function(reason) {
		Discord.sendMessage(`BOT HAD BEEN KICKED FOR ` + reason + ' :crab:');
		relog();
	});

	bot.on('login', function() {
		bot.chat(commands.welcomeMessage);
	});

	var spamMessages = ['[Bot] Did you know you could do ?fact for a random fact? It\'s epic, I know. Do ?help for more!',
	                    '[Bot] Join Unnamed group\'s discord server to participate in upcoming giveaways (3 winners & 3 kits!) https://discord.gg/ZXvVQtg', 
	                    '[Bot] Have troubles with progression on the server? Buy shulkers with THE cheapest prices from THE best group! https://discord.gg/ZXvVQtg',
	                    '[Bot] Have troubles with progression on the server? Buy shulkers with THE cheapest prices from THE best group! https://discord.gg/ZXvVQtg',
	                    '[Bot] Buy kits from Unnamed group and your dick will grow 3 inches (We have proof and reviews!) https://discord.gg/ZXvVQtg',
	                    '[Bot] Buy kits from Unnamed group and your dick will grow 3 inches (We have proof and reviews!) https://discord.gg/ZXvVQtg'];


	executeAsync(async function() {
		while (true) {
			await sleep((Math.random() * 100000) + 30000).then(async function() {
				randomIndex = Math.floor(Math.random() * spamMessages.length);
				bot.chat(spamMessages[randomIndex]);

				// checking last time message was sent
				await sleep(15000).then(()=>{
					if (Date.now() - lastTimeMessage > 30000) {
						Discord.sendMessage('\`timed out\`')
						relog();
					}
				});
				
			});
		}
	}, 10);

}

async function executeAsync(func) {
    setTimeout(func, 0);
}

// sleep time expects milliseconds
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}




relog(false);
