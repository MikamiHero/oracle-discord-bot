const config = require("../config");
const twitchAPI = require("twitch-api-v5");
const rp = require("request-promise");
const isEmpty = require("lodash.isempty");
const head = require("lodash.head");
const moment = require("moment");

class TwitchAPIError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

const twitchLiveFlagGlobal = false;

const twitchAuthenticate = async () => {
  // Setting up the options for the request
  const clientIdQuery = `client_id=${config.twitchAppClientId}`;
  const clientSecretQuery = `client_secret=${config.twitchAppClientSecret}`;
  const clientGrantTypeQuery = `grant_type=client_credentials`;
  const options = {
    uri:
      "https://id.twitch.tv/oauth2/token" + `?${clientIdQuery}` + `&${clientSecretQuery}` + `&${clientGrantTypeQuery}`,
    method: "POST",
    json: true
  };
  // Make the request to get the bearer token
  try {
    const auth = await rp(options);
    return auth;
  } catch (err) {
    throw new TwitchAPIError(err.toString());
  }
};

const twitchGetChannelIdByUsername = async ({ username = config.twitchDefaultChannelName }) => {
  // Make the request
  let twitchChannel;
  try {
    twitchAPI.clientID = config.twitchAppClientId;
    twitchChannel = await new Promise((resolve, reject) => {
      twitchAPI.users.usersByName({ users: username }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  } catch (err) {
    throw new TwitchAPIError(err.toString());
  }
  if (twitchChannel["_total"] !== 1) {
    throw new TwitchAPIError("Somehow we got no channels or multiple channels? Total: ", twitchChannel["_total"]);
  }
  // By this point, we should only have one channel
  const twitchChannelId = twitchChannel.users[0]["_id"];
  return twitchChannelId;
};

const twitchIsChannelLive = async () => {
  let twitchChannel;
  try {
    twitchAPI.clientID = config.twitchAppClientId;
    // First get the ID of the channel you want to investigate
    const twitchChannelId = await twitchGetChannelIdByUsername({});
    console.log("Twitch channel ID " + twitchChannelId);
    // Make the request to see if the channel is live
    twitchChannel = await new Promise((resolve, reject) => {
      twitchAPI.streams.channel({ channelID: twitchChannelId }, (err, res) => {
        if (err) {
          console.log("error inside promise: ", err);
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  } catch (err) {
    throw new TwitchAPIError(err.toString());
  }
  // stream property will be null if channel is NOT live
  if (!twitchChannel.stream) {
    console.log("Twitch channel is NOT live");
    // If we were live but then went offline, flick the flag back to false
    if (twitchLiveFlagGlobal === true) {
      twitchLiveFlagGlobal = false;
    }
    return {};
  } else {
    console.log("Twitch channel is live");
    // If we are live and the global flag is set to false, it means we just went live and return a filled object
    if (twitchLiveFlagGlobal === false) {
      twitchLiveFlagGlobal = true;
      return {
        twitchURL: twitchChannel.stream.channel.url,
        twitchStreamTitle: twitchChannel.stream.channel.status,
        twitchGame: twitchChannel.stream.channel.game
      };
    }
    // If we are live and the global flag is set to true, it means we're still live and we don't want to keep spamming Discord messages
    return {};
  }
};

const twitchLastTimeLive = async () => {
  let twitchChannel;
  try {
    twitchAPI.clientID = config.twitchAppClientId;
    // First get the ID of the channel you want to investigate
    const twitchChannelId = await twitchGetChannelIdByUsername({});
    // Check to see if we're already live. If we're not live, get check to see when we were last live
    const twitchChannelLive = await twitchIsChannelLive();
    if (!isEmpty(twitchChannelLive)) {
      // TODO: Something that will feed into the Discord server
      return;
    }
    // Get the top VOD created on the channel
    twitchChannel = await new Promise((resolve, reject) => {
      twitchAPI.channels.videos({ channelID: twitchChannelId, limit: 1 }, (err, res) => {
        if (err) {
          console.log("error inside promise: ", err);
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
    // Filter out only the an archived video (i.e., omitting highlights which also get returned in this request)
    const twitchLastBroadcast = head(twitchChannel.videos.filter(video => video.broadcast_type === "archive"));
    if (isEmpty(twitchLastBroadcast)) {
      // TODO: Return message to say I haven't been live in over 2 months (as that's the limit for partner VODs)
      return;
    }
    // Calculate the time difference between now and when the last archived broadcast was created
    const dateNow = moment();
    const twitchLastLiveDate = moment(twitchLastBroadcast.created_at);
    console.log(`The last time MikamiHero was LIVE was approx. ${dateNow.diff(twitchLastLiveDate, "days")} days ago.`);
  } catch (err) {
    throw new TwitchAPIError(err.toString());
  }
};

/* TO DO: Need to authorize as my channel. Bot does app token whereas you need user token 
  https://dev.twitch.tv/docs/authentication/#types-of-tokens
*/
// const twitchGetBanList = async () => {
//   try {
//     // Need to authenticate and retrieve Bearer token to make the request
//     const bearerToken = await twitchAuthenticate();
//     console.log(bearerToken);
//     // Getting Twitch channel via ID
//     const twitchChannelId = await twitchGetChannelIdByUsername({});
//     // Constructing the options for the request
//     const options = {
//       uri: `https://api.twitch.tv/helix/moderation/banned?broadcaster_id=${twitchChannelId}`,
//       method: "GET",
//       json: true,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${bearerToken.access_token}`
//       }
//     };
//     const getBanList = await rp(options);
//     console.log(getBanList);
//     return getBanList;
//   } catch (err) {
//     throw new TwitchAPIError(err.toString());
//   }
// };

module.exports = { twitchAuthenticate, twitchIsChannelLive, twitchLastTimeLive };
