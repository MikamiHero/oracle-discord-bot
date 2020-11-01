const { discordGetLastLivePosting } = require("../utils/discordUtils");
const { tweetIsUnderLimit, tweetStreamGoingLive } = require("../utils/twitUtils");

// Example usage !goinglive (NB: This will only work for MikamiHero)
module.exports = {
  name: "goinglive",
  category: "twitch",
  description: `Gets Oracle to post to my Twitter that I'm going live`,
  hidden: true,
  run: async ({ discordClient, message }) => {
    try {
      await message.channel.send("Checking for last live message...");
      const msgToPostToTwitter = await discordGetLastLivePosting({ discordClient });
      const msgUnderTwitterLimit = await tweetIsUnderLimit({ tweet: msgToPostToTwitter });
      if (!msgUnderTwitterLimit) {
        return message.channel.send("Last message too long... please adjust");
      }
      await message.channel.send("Posting to Twitter...");
      const tweetResponse = await tweetStreamGoingLive({ goingLiveTweet: msgToPostToTwitter });
      // This part below is a bit messy. I should format this properly but lazy lol
      return message.channel.send("Tweet sent!");
    } catch (err) {
      return message.channel.send(`Something went wrong... \`${err.message}\``);
    }
  },
};
