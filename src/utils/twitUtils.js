const Twit = require("twit");
const config = require("../config");
const moment = require("moment");
const head = require("lodash.head");
const { post } = require("request-promise");

const Twitter = new Twit({
  consumer_key: config.twitConsumerKey,
  consumer_secret: config.twitConsumerSecret,
  access_token: config.twitAccessToken,
  access_token_secret: config.twitAccessTokenSecret,
});

class TwitError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

const tweetCharLimit = 280;

const tweetParams = {
  lastTweet: {
    endPoint: "statuses/user_timeline",
    params: {
      screen_name: "MikamiHero",
      count: 1,
      exclude_replies: true,
      include_rts: false,
    },
  },
  recentTweets: {
    endPoint: "statuses/user_timeline",
    params: {
      screen_name: "MikamiHero",
      count: 10,
      exclude_replies: true,
      include_rts: false,
    },
  },
  streamGoingLiveTweet: {
    endPoint: "statuses/update",
  },
  deleteTweet: {
    endPoint: "statuses/destroy",
    params: {
      trim_user: true,
    },
  },
};

const tweetGetURL = ({ tweetData }) => {
  if (!tweetData) {
    return null;
  }
  const textURLIndex = tweetData.text.indexOf("https");
  const textURL = textURLIndex === -1 ? null : tweetData.text.substring(textURLIndex);
  const entityURLIndex = head(tweetData.entities.urls);
  const entityURL = !entityURLIndex ? null : entityURLIndex.url;
  return textURL || entityURL;
};

const tweetGetLastTweet = async () => {
  try {
    return await Twitter.get(tweetParams.lastTweet.endPoint, tweetParams.lastTweet.params);
  } catch (err) {
    throw new TwitError(`Problem in Twitter API posting: ${err.message}`);
  }
};

const getRecentTweets = async () => Twitter.get(tweetParams.recentTweets.endPoint, tweetParams.recentTweets.params);

const noStreamFilter = ({ tweetText }) => {
  const noStreamTriggers = ["No stream", "no stream", "cancel stream"];
  const noStreamBool = noStreamTriggers.map((trigger) => tweetText.includes(trigger));
  return noStreamBool.some((bool) => bool === true);
};

const getLatestNoStreamTweet = ({ tweets }) =>
  tweets.find((tweet) => noStreamFilter({ tweetText: tweet.text }) === true);

const last24Hours = ({ tweetDate }) =>
  moment().diff(moment(tweetDate, "dd MMM DD HH:mm:ss ZZ YYYY", "en"), "hours") < 24;

const getNoStreamTweet = async () => {
  try {
    // Get the most recent tweets
    const recentTweets = await getRecentTweets();
    // Filter out tweets that haven't been in the last 24 hours since now
    const tweetsInLast24Hrs = recentTweets.data.filter((tweet) => last24Hours({ tweetDate: tweet.created_at }));
    // Of those tweets in the last 24 hours, see if any of them contain a 'no stream' trigger
    const noStreamTweet = getLatestNoStreamTweet({ tweets: tweetsInLast24Hrs });
    // If no tweet fires off the trigger, return empty. Else extract URL
    return !noStreamTweet ? null : tweetGetURL({ tweetData: noStreamTweet });
  } catch (err) {
    throw new TwitError("Problem in Twitter API calling: ", err);
  }
};

const tweetStreamGoingLive = async ({ goingLiveTweet }) => {
  try {
    const tweet = {
      status: tweetRemoveEveryoneTag({ tweet: goingLiveTweet }),
    };
    return await Twitter.post(tweetParams.streamGoingLiveTweet.endPoint, tweet);
  } catch (err) {
    throw new TwitError(`Problem in Twitter API posting: ${err.message}`);
  }
};

const tweetIsUnderLimit = async ({ tweet }) => {
  try {
    const tweetLength = tweet.length;
    return tweetLength <= tweetCharLimit;
  } catch (err) {
    throw new TwitError(`Problem in Twitter API posting: ${err.message}`);
  }
};

const tweetRemoveEveryoneTag = ({ tweet }) => tweet.split("@everyone ").pop();

const tweetDelete = async ({ tweetID }) => {
  try {
    const deletedTweet = await Twitter.post(
      `${tweetParams.deleteTweet.endPoint}/${tweetID}`,
      tweetParams.deleteTweet.params
    );
    return deletedTweet;
  } catch (err) {
    throw new TwitError(`Problem in Twitter API posting: ${err.message}`);
  }
};

module.exports = {
  tweetGetLastTweet,
  getNoStreamTweet,
  tweetStreamGoingLive,
  tweetIsUnderLimit,
  tweetDelete,
  // These functions below aren't being exported for usage; only unit tests
  last24Hours,
};
