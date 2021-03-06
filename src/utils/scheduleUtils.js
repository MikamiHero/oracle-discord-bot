const isEmpty = require("lodash.isempty");
const moment = require("moment");
const config = require("../config");
const cron = require("node-cron");
const { getNoStreamTweet, tweetStreamGoingLive } = require("./twitUtils");
const { discordNoStreamSendMessage, discordStreamLiveSendMessage } = require("./discordUtils");
const { twitchIsChannelLive } = require("./twitchUtils");

class ScheduleJobError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

// const checkStreamLiveJob = async ({ discordClient }) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const twitchStreamObj = await twitchIsChannelLive();
//       if (!isEmpty(twitchStreamObj)) {
//         // Message my Discord to say I've gone live
//         await discordStreamLiveSendMessage({
//           discordClient,
//           streamTitle: twitchStreamObj.twitchStreamTitle,
//           twitchURL: twitchStreamObj.twitchURL
//         });
//         // Post a Tweet to say I've gone live
//         await tweetStreamGoingLive({
//           twitchURL: twitchStreamObj.twitchURL,
//           streamTitle: twitchStreamObj.twitchStreamTitle
//         });
//       }
//       resolve(true);
//     } catch (err) {
//       reject(err);
//     }
//   });
// };

const checkNoStreamJob = async ({ discordClient }) => {
  console.log("Executing scheduled job for no stream tweet", moment().toString());
  const tweetURL = await getNoStreamTweet();
  console.log("tweetURL");
  if (tweetURL) {
    await discordNoStreamSendMessage({ discordClient, tweetURL });
  } else {
    console.log("No tweet detected that indicates no streaming at: ", moment().toString());
  }
};

const runScheduledJobs = async ({ discordClient }) => {
  try {
    // At 22:00 on Monday, Wednesday, Saturday, and Sunday.
    cron.schedule("0 22 * * 1,3,6,7", () => {
      checkNoStreamJob({ discordClient });
    });
    //Check every 5 minute to see if my Twitch stream is live
    // setInterval(() => {
    //checkStreamLiveJob({ discordClient });
    // }, 1000 * 60);
  } catch (err) {
    throw new ScheduleJobError(`Problem with running scheduled jobs: ${err.message}`);
  }
};

module.exports = { runScheduledJobs };
