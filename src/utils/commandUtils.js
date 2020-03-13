const config = require("../config");
const moment = require("moment");
const humanizeDuration = require("humanize-duration");
const Discord = require("discord.js");
const {
  speedrunGetLatestPBForUser,
  speedrunGetUserID,
  speedrunGetWRForGameAndCategory,
  speedrunGetUsernameFromID
} = require("../utils/speedrunUtils");
const { twitchLastTimeLive } = require("../utils/twitchUtils");

// Command to see when I was last live
const cmdGetLastTimeLiveOnTwitch = async ({ discordClient, message, args }) => {
  if (args.length === 0) {
    // If no args, they need to provide a user
    return message.reply("You need to provide a Twitch username.");
  }
  const lastTimeLive = await twitchLastTimeLive({ username: args[0] });
  console.log(lastTimeLive);
  if (lastTimeLive === null) {
    // Null return means channel is love
    return message.reply("Channel is currently live.");
  } else if (lastTimeLive === -1) {
    // -1 return means it's been over 2 months (i.e., no past broadcasts)
    return message.reply("Channel hasn't been live for a very long time.");
  }
  return message.reply(`The last time MikamiHero was LIVE was approx ${lastTimeLive} days ago.`);
};

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
    const latestSpeedrunPBForUser = await speedrunGetLatestPBForUser({
      userID: speedrunUserID
    });
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

// Command to get the WR for a game and category
const cmdGetWRForGameAndCategory = async ({ discordClient, message }) => {
  // Constructing the args
  const args = message.content.match(/"(.+?)"/g);
  // If no args, invalid
  if (!args) {
    return message.reply("You need to provide a game and category!");
  }
  // if args length is NOT 2, please warn
  if (args.length !== 2) {
    return message.reply("You need to provide BOTH a game and category!");
  }
  // Otherwise, unpack the args
  const processedArgs = args.map(a => a.replace(/"/g, ""));
  const game = processedArgs[0];
  const category = processedArgs[1];
  // Make request now
  try {
    // Now making the request for the game and WR in specified category
    const wr = await speedrunGetWRForGameAndCategory({
      game: game,
      category: category
    });
    // If null, it means something went wrong with fetching the user's PBs
    if (!wr) {
      return message.reply("Something went wrong with fetching the WR for the game and category.");
    }
    // Now to retrieve the user
    const user = await speedrunGetUsernameFromID({ userID: wr.players[0].id });
    // If no user, something went wrong
    if (!user) {
      return message.reply("Something went wrong with fetching the user.");
    }
    // Final message with WR and details
    return message.reply(
      `WR for ${game} ${category} is ${humanizeDuration(
        moment.duration(wr.times["primary_t"], "seconds")
      )} by ${user}. ${wr.videos ? wr.videos.links[0].uri : "No video"}`
    );
  } catch (err) {
    // Log the error to the private text channel only admin can see
    console.log(err);
    // Return a message to the user saying that there's been an error
    return message.reply("An error has occurred. The admin has been notified.");
  }
};

module.exports = { cmdGetLatestPBForUser, cmdGetWRForGameAndCategory, cmdGetLastTimeLiveOnTwitch };
