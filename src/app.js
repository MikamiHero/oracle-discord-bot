const Discord = require("discord.js");
const config = require("./config");
const moment = require("moment");
const { runScheduledJobs } = require("./utils/scheduleUtils");
const { discordRebootMessage } = require("./utils/discordUtils");

/* Setting up Discord client and Twit instance */
const client = new Discord.Client();

client.on("ready", async () => {
  console.log(config.nodeEnv);
  console.log("Connected as ", client.user.tag, " at ", moment().toString());
  await discordRebootMessage({ discordClient: client });
  // Check schedule jobs and run any that have been set up
  await runScheduledJobs({ discordClient: client }).catch(e => console.log(e));
});

const botToken = config.botToken;
client.login(botToken);
