const config = require("../config");
const twitchAPI = require("twitch-api-v5");
const rp = require("request-promise");

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
    // Make the request to see if the channel is live
    twitchChannel = await new Promise((resolve, reject) => {
      twitchAPI.streams.channel({ channelID: twitchChannelId }, (err, res) => {
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
  // stream property will be null if channel is NOT live
  if (!twitchChannel.stream) {
    // If we were live but then went offline, flick the flag back to false
    if (twitchLiveFlagGlobal === true) {
      twitchLiveFlagGlobal = false;
    }
    return {};
  } else {
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

module.exports = { twitchAuthenticate, twitchIsChannelLive };
