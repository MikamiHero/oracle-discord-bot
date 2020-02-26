const Discord = require("discord.js");
const config = require("./config");
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const { runScheduledJobs } = require("./utils/scheduleUtils");
const { discordRebootMessage } = require("./utils/discordUtils");
const { speedrunGetWRForGameAndCategory } = require("./utils/speedrunUtils");
const { twitchLastTimeLive } = require("./utils/twitchUtils");

const commandsDir = `${path.join(__dirname)}/commands/`;
const eventsDir = `${path.join(__dirname)}/events/`;

/* Setting up Discord client and Twit instance */
const client = new Discord.Client();

// Commands (e.g., ?ping)
client.commands = new Discord.Collection();
fs.readdir(commandsDir, (err, files) => {
  if (err) {
    console.error(err);
  }
  // Filter out only to get .js files
  const commandFiles = files.filter(f => f.endsWith(".js"));
  // Setting the command up via a collection
  commandFiles.forEach(file => {
    const command = require(`${commandsDir}/${file}`);
    client.commands.set(command.name, command);
  });
});

// Events (e.g., message)
fs.readdir(eventsDir, (err, files) => {
  if (err) {
    console.error(err);
  }
  // Filter out only to get .js files
  const eventFiles = files.filter(f => f.endsWith(".js"));
  eventFiles.forEach(file => {
    // Binding the event with its proper arguments
    const event = require(`${eventsDir}/${file}`);
    const eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

client.on("ready", async () => {
  console.log(config.nodeEnv);
  console.log("Connected as ", client.user.tag, " at ", moment().toString());
  await discordRebootMessage({ discordClient: client });
  // Check schedule jobs and run any that have been set up
  await runScheduledJobs({ discordClient: client }).catch(e => console.log(e));
  //await speedrunGetWRForGameAndCategory({ game: "oot", category: "any%" });
  await twitchLastTimeLive();
});

const botToken = config.botToken;
client.login(botToken);
