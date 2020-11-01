const { tweetDelete, tweetGetLastTweet } = require("../utils/twitUtils");

// Example usage !twitterclear (NB: This will only work for MikamiHero)
module.exports = {
  name: "twitterclear",
  category: "twitter",
  description: `Removes all the tweets on my Twitter page (except pinned)`,
  hidden: true,
  run: async ({ message }) => {
    try {
      await message.channel.send("Checking the last tweets that were made...");
      const lastTweet = await tweetGetLastTweet();
      if (lastTweet.data.length === 0) {
        return message.channel.send("No tweets! You're clear");
      }
      const lastTweetID = lastTweet.data[0].id_str;
      await message.channel.send("Found tweets. Deleting...");
      const deletedTweets = await tweetDelete({ tweetID: lastTweetID });
      return message.channel.send("Done. Tweets deleted...");
    } catch (err) {
      return message.channel.send(`Something went wrong... \`${err.message}\``);
    }
  },
};
