const config = require("../config");
const moment = require("moment");
const humanizeDuration = require("humanize-duration");
const Discord = require("discord.js");
const { speedrunGetLatestPBForUser, speedrunGetUserID } = require("../utils/speedrunUtils");

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
    // First get the ID of the user on speedrun.com (ephemeral ID)
    const speedrunUserID = await speedrunGetUserID({ username });
    // If null, it means something went wrong with fetching the user data
    if (!speedrunUserID) {
      return message.reply("Something went wrong with getting the user.");
    }
    // Now making the request for their latest PB based on user ID
    const latestSpeedrunPBForUser = await speedrunGetLatestPBForUser({ userID: speedrunUserID });
    // If null, it means something went wrong with fetching the user's PBs
    if (!latestSpeedrunPBForUser) {
      return message.reply("Something went wrong with getting the user's PBs.");
    }
    // Create the embed to return to the user
    let speedrunPBEmbed = new Discord.RichEmbed();
    speedrunPBEmbed.setColor("#775aac");
    speedrunPBEmbed.setAuthor(`Latest PB for ${username}`);
    speedrunPBEmbed.addField("Game", latestSpeedrunPBForUser.run.game);
    speedrunPBEmbed.addField("Category", latestSpeedrunPBForUser.run.category, true);
    speedrunPBEmbed.addField(
      "Time",
      humanizeDuration(moment.duration(latestSpeedrunPBForUser.run.times["primary_t"], "seconds")),
      true
    );
    speedrunPBEmbed.addField("Place", latestSpeedrunPBForUser.place, true);
    speedrunPBEmbed.addField("Link", latestSpeedrunPBForUser.run.weblink, true);

    return message.reply(speedrunPBEmbed);
  } catch (err) {
    // Log the error to the private text channel only admin can see
    console.log(err);
    // Return a message to the user saying that there's been an error
    return message.reply("An error has occurred. The admin has been notified.");
  }
};

module.exports = { cmdGetLatestPBForUser };
