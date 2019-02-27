const config = require("../config");
const moment = require("moment");

class DiscordError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

const discordNoStreamSendMessage = async ({ discordClient, tweetURL }) => {
  try {
    const generalChannel = discordClient.channels.find(
      ch => ch.name === config.discordGeneralChannel
    );
    const message = `@everyone Unfortunately, Mikami cannot stream tonight: ${tweetURL} \n He will see you all soon!`;
    await generalChannel.send(message);
  } catch (err) {
    throw new DiscordError("Error in discordNoStreamSendMessage: ", err);
  }
};

const discordStreamLiveSendMessage = async ({ discordClient, twitchURL, streamTitle }) => {
  try {
    const generalChannel = discordClient.channels.find(
      ch => ch.name === config.discordGeneralChannel
    );
    const message = `@everyone LIVE :smile: ${streamTitle} Hope to see you all there ${twitchURL}`;
    await generalChannel.send(message);
  } catch (err) {
    throw new DiscordError("Error in discordStreamLiveSendMessage: ", err);
  }
};

const discordRebootMessage = async ({ discordClient }) => {
  try {
    const generalChannel = discordClient.channels.find(
      ch => ch.name === config.discordGeneralChannel
    );
    const message = `Rebooting complete. Build successful at time ${moment().toString()} :robot: Ready to rock!`;
    await generalChannel.send(message);
  } catch (err) {
    throw new DiscordError("Error in discordStreamLiveSendMessage: ", err);
  }
};

module.exports = {
  discordNoStreamSendMessage,
  discordStreamLiveSendMessage,
  discordRebootMessage
};
