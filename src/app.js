const Discord = require("discord.js");
const config = require("./config");
const { runScheduledJobs } = require("./utils/scheduleUtils");
const { discordRebootMessage } = require("./utils/discordUtils");

/* Setting up Discord client and Twit instance */
const client = new Discord.Client();

client.on("ready", async () => {
  console.log(config.nodeEnv);
  console.log("Connected as ", client.user.tag);
  // Check schedule jobs and run any that have been set up
  await runScheduledJobs({ discordClient: client });
  await discordRebootMessage({ discordClient: client });
});

const botToken = config.botToken;
client.login(botToken);
