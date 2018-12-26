const schedule = require("node-schedule");
const isEmpty = require("lodash.isempty");
const config = require("../config");
const { getNoStreamTweet } = require("./twitUtils");
const { discordNoStreamSendMessage, discordStreamLiveSendMessage } = require("./discordUtils");
const { twitchIsChannelLive } = require("./twitchUtils");

class ScheduleJobError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

const checkStreamLiveJob = async ({ discordClient }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const twitchStreamObj = await twitchIsChannelLive();
      if (!isEmpty(twitchStreamObj)) {
        await discordStreamLiveSendMessage({
          discordClient,
          streamTitle: twitchStreamObj.twitchStreamTitle,
          twitchURL: twitchStreamObj.twitchURL
        });
      }
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
};

const checkNoStreamJob = async ({ discordClient }) => {
  const rule = new schedule.RecurrenceRule();
  // We want to only check for no stream tweets on Mon, Wed, Sat and Sun (Tue, Thur, Fri are always confirmed no stream days)
  rule.dayOfWeek = [0, 1, 3, 6];
  // Time to check for no stream tweet should be 9:30pm
  rule.hour = 21;
  rule.minute = 30;
  await schedule.scheduleJob(rule, async () => {
    const tweetURL = getNoStreamTweet();
    if (tweetURL) {
      await discordNoStreamSendMessage({ discordClient, tweetURL });
    }
  });
};

const runScheduledJobs = async ({ discordClient }) => {
  try {
    checkNoStreamJob({ discordClient });
    // Check every minute to see if my Twitch stream is live
    setInterval(() => {
      checkStreamLiveJob({ discordClient });
    }, 1000);
  } catch (err) {
    throw new ScheduleJobError("Problem with running scheduled jobs: ", err.toString());
  }
};

module.exports = { runScheduledJobs };
