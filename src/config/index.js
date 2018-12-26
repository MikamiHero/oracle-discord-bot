const config = require("./config.json");

config.nodeEnv = process.env.NODE_ENV;
config.botToken = config[config.nodeEnv].botToken;
config.discordGeneralChannel = config[config.nodeEnv].discordGeneralChannel;
config.twitchAppClientId = config[config.nodeEnv].twitchAppClientId;
config.twitchAppClientSecret = config[config.nodeEnv].twitchAppClientSecret;
config.twitchDefaultChannelName = config[config.nodeEnv].twitchDefaultChannelName;
config.twitConsumerKey = config[config.nodeEnv].consumer_key;
config.twitConsumerSecret = config[config.nodeEnv].consumer_secret;
config.twitAccessToken = config[config.nodeEnv].access_token;
config.twitAccessTokenSecret = config[config.nodeEnv].access_token_secret;

module.exports = config;
