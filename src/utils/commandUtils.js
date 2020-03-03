const config = require("../config");
const moment = require("moment");
const Discord = require("discord.js");
const { speedrunGetLatestPBForUser } = require("../utils/speedrunUtils");

// Command to get the latest PB for someone off speedrun.com
const cmdGetLatestPBForUser = async ({ discordClient, message, args }) => {
  // If no arg was provided, reply to user saying you need an argument (i.e., username)
  if (args.length === 0) {
    return message.reply("You need to provide a username with this command.");
  }
  // Only taking the first argument, and stripping away any quotes they may have used
  const username = args[0].replace(/"/g, "");
  // Calling the speedrun utility function that will fetch the data via speedrun.com API
  try {
    const speedrunPBForUser = await speedrunGetLatestPBForUser({ username });
  } catch (err) {
    // Log the error to the private text channel only admin can see
    console.log(err);
    // Return a message to the user saying that there's been an error
    return message.reply("An error has occurred. The admin has been notified.");
  }
};

module.exports = { cmdGetLatestPBForUser };
