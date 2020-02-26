const config = require("./config.json");

// Config taken from environment variables
config.nodeEnv = process.env.NODE_ENV;
config.botToken = process.env.DISCORD_BOT_TOKEN;
config.twitchAppClientId = process.env.TWITCH_APP_CLIENT_ID;
config.twitchAppClientSecret = process.env.TWITCH_APP_CLIENT_SECRET;
config.twitConsumerKey = process.env.TWITTER_CONSUMER_KEY;
config.twitConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
config.twitAccessToken = process.env.TWITTER_ACCESS_TOKEN;
config.twitAccessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

// Config taken from config.json file
config.discordGeneralChannel = config[config.nodeEnv].discordGeneralChannel;
config.discordBotLogChannel = config[config.nodeEnv].discordBotLogChannel;
config.discordModChannel = config[config.nodeEnv].discordModChannel;
config.discordNewsChannel = config[config.nodeEnv].discordNewsChannel;
config.twitchDefaultChannelName = config[config.nodeEnv].twitchDefaultChannelName;
config.commandPrefix = config[config.nodeEnv].commandPrefix;

module.exports = config;
