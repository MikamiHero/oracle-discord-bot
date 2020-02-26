const config = require("../config");
const moment = require("moment");
const Discord = require("discord.js");
const { twitchGetBanList } = require("../utils/twitchUtils");

const manageMembers = "MANAGE_MEMBERS";
const liveRole = "LIVE";
const questionPollChoices = [
  "\u{1F1E6}", // Emoji A
  "\u{1F1E7}", // Emoji B
  "\u{1F1E8}", // Emoji C
  "\u{1F1E9}", // Emoji D
  "\u{1F1EA}", // Emoji E
  "\u{1F1EB}", // Emoji F
  "\u{1F1EC}" // Emoji G
];

class DiscordError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

const discordNoStreamSendMessage = async ({ discordClient, tweetURL }) => {
  try {
    const generalChannel = discordClient.channels.find(ch => ch.name === config.discordGeneralChannel);
    const message = `@everyone Unfortunately, Mikami cannot stream tonight: ${tweetURL} \n He will see you all soon!`;
    await generalChannel.send(message);
  } catch (err) {
    throw new DiscordError("Error in discordNoStreamSendMessage: ", err);
  }
};

const discordStreamLiveSendMessage = async ({ discordClient, twitchURL, streamTitle }) => {
  try {
    const generalChannel = discordClient.channels.find(ch => ch.name === config.discordGeneralChannel);
    const message = `@everyone LIVE :smile: ${streamTitle} Hope to see you all there ${twitchURL}`;
    await generalChannel.send(message);
  } catch (err) {
    throw new DiscordError("Error in discordStreamLiveSendMessage: ", err);
  }
};

const discordRebootMessage = async ({ discordClient }) => {
  try {
    const generalChannel = discordClient.channels.find(ch => ch.name === config.discordGeneralChannel);
    const message = `Rebooting complete. Build successful at time ${moment().toString()} :robot: Ready to rock!`;
    await generalChannel.send(message);
  } catch (err) {
    throw new DiscordError("Error in discordStreamLiveSendMessage: ", err);
  }
};

const discordAddRole = async ({ discordClient, message, args }) => {
  // Example usage !addrole @user <role>

  // Need to make sure member has permissions to do add role
  if (!message.member.hasPermission([manageMembers])) {
    return message.reply("\u{1F626} Sorry, mate. You don't have permissions!");
  }
  // Extract the user
  const roleMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
  if (!roleMember) {
    return message.reply("User couldn't be found...");
  }

  // ID is always 22 chars
  const role = args.join(" ").slice(22);
  if (!role) {
    return message.reply("Please specify a role!");
  }
  // Finding the respective role to add
  const guildRole = message.guild.roles.find(x => x.name === role);
  if (!guildRole) {
    return message.reply("Couldn't find that role!");
  }
  // Finding the logs channel
  const botLogChannel = discordClient.channels.find(ch => ch.name === config.discordBotLogChannel);

  // If the user already has the role, return and log
  if (roleMember.roles.has(guildRole.id)) {
    const message = `:stuck_out_tongue: ${roleMember} already has role ${guildRole}`;
    return botLogChannel.send(message);
  }

  // Add role
  try {
    await roleMember.addRole(guildRole.id);
    const message = `:thumbsup: ${roleMember} has been successfully assigned the role ${guildRole}`;
    return botLogChannel.send(message);
  } catch (err) {
    console.error(err);
  }
};

const discordRemoveRole = async ({ discordClient, message, args }) => {
  // Example usage !removerole @user <role>

  // Need to make sure member has permissions to do remove role
  if (!message.member.hasPermission([manageMembers])) {
    return message.reply("\u{1F626} Sorry, mate. You don't have permissions!");
  }
  // Extract the user
  const roleMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
  if (!roleMember) {
    return message.reply("User couldn't be found...");
  }
  // ID is always 22 chars
  const role = args.join(" ").slice(22);
  if (!role) {
    return message.reply("Please specify a role!");
  }
  // Finding the respective role to add
  const guildRole = message.guild.roles.find(x => x.name === role);
  if (!guildRole) {
    return message.reply("Couldn't find that role!");
  }
  // Finding the logs channel
  const botLogChannel = discordClient.channels.find(ch => ch.name === config.discordBotLogChannel);

  // If the user doesn't have the role, it means it's been removed already
  if (!roleMember.roles.has(guildRole.id)) {
    const message = `:stuck_out_tongue: ${roleMember} already has role ${guildRole} removed`;
    return botLogChannel.send(message);
  }

  // Remove role
  try {
    await roleMember.removeRole(guildRole.id);
    const message = `:thumbsup: ${roleMember} has been successfully removed from the role ${guildRole}`;
    return botLogChannel.send(message);
  } catch (err) {
    console.error(err);
  }
};

// Custom function just for adding when a user has gone live, add that custom role (automated)
const discordAddLiveRole = async ({ discordClient, userId }) => {
  const botLogChannel = discordClient.channels.find(ch => ch.name === config.discordBotLogChannel);
  // Fetch the guildMember object that contains the user in question
  const member = discordClient.fetchUser(userId);
  if (!member) {
    const errMsg = `User with ID: ${userId} could NOT be found`;
    return botLogChannel.send(errMsg);
  }
  // Finding the LIVE role to add
  const role = message.guild.roles.find(x => x.name === liveRole);
  if (!role) {
    const errMsg = `Role ${liveRole} could NOT be found`;
    return botLogChannel.send(errMsg);
  }
  // If the user already has the LIVE role, return and log
  if (member.roles.has(role.id)) {
    const errMsg = `User ${member.user.username} already has LIVE role`;
    return botLogChannel.send(errMsg);
  }

  // Add LIVE role
  try {
    await member.addRole(role.id);
    const message = `:thumbsup: ${member} has been successfully assigned the role ${role}`;
    return botLogChannel.send(message);
  } catch (err) {
    throw new DiscordError("Error in discordAddLiveRole: ", err);
  }
};

// Custom function just for removing when a user is done streaming, remove that custom role (automated)
const discordRemoveLiveRole = async ({ discordClient, userId }) => {
  const botLogChannel = discordClient.channels.find(ch => ch.name === config.discordBotLogChannel);
  // Fetch the guildMember object that contains the user in question
  const member = discordClient.fetchUser(userId);
  if (!member) {
    const errMsg = `User with ID: ${userId} could NOT be found`;
    return botLogChannel.send(errMsg);
  }
  // Finding the LIVE role to add
  const role = message.guild.roles.find(x => x.name === liveRole);
  if (!role) {
    const errMsg = `Role ${liveRole} could NOT be found`;
    return botLogChannel.send(errMsg);
  }
  // If the user already has the LIVE role removed, return and log
  if (!member.roles.has(role.id)) {
    const errMsg = `User ${member.user.username} already has LIVE role removed`;
    return botLogChannel.send(errMsg);
  }

  // Remove LIVE role
  try {
    await member.removeRole(role.id);
    const message = `:thumbsup: ${member} has been successfully removed from the role ${role}`;
    return botLogChannel.send(message);
  } catch (err) {
    throw new DiscordError("Error in discordRemoveLiveRole: ", err);
  }
};

// Fetch the current ban list
const discordFetchBans = async ({ discordClient, message, args }) => {
  // Need to make sure member has permissions to do trigger ban list
  if (!message.member.hasPermission([manageMembers])) {
    return message.reply("\u{1F626} Sorry, mate. You don't have permissions!");
  }
  const msg = await message.channel.send("Fetching...");
  // Doing a quick check to see if the message was sent from the mod channel
  if (message.channel.name !== config.discordModChannel) {
    return msg.edit("Sorry, I cannot divulge this info in this channel.");
  }

  // Fetching the bans (bot must have kick/ban users permissions) which returns a Discord Collection
  try {
    const banList = await message.guild.fetchBans();
    const banListCurated = banList.map(banned => banned.username.concat("#", banned.discriminator)).join(", ");
    return msg.edit(`These are the following banned users: ${banListCurated}`);
  } catch (err) {
    throw new DiscordError("Error in discordFetchBans: ", err);
  }
};

const discordStartPoll = async ({ discordClient, message }) => {
  // Checking that the user of the command has permissions
  const allowedRole = message.guild.roles.find(role => role.name === "BatAdmin");
  if (!message.member.roles.has(allowedRole.id)) {
    return message.reply("\u{1F44E} You do not have permission for this command!");
  }
  // Constructing custom args
  const args = message.content.match(/"(.+?)"/g);
  if (!args) {
    return message.reply("Invalid Poll! Question and options should be wrapped in double quotes.");
  }
  // if args length is 1, it means a binary question (e.g., yes or not)
  if (args.length === 1) {
    const emojiList = discordClient.emojis.map(e => e.toString()).join(" ");
    message.channel.send(emojiList);
    const question = args[0].replace(/"/g, "");
    return message.channel.send(question).then(async pollMessage => {
      await pollMessage.react("\u{1F44D}"); // Thumbs up
      await pollMessage.react("\u{1F44E}"); // Thumbs down
    });
  }
  // Otherwise, we're parsing multiple options with which people can react to with letters
  const processedArgs = args.map(a => a.replace(/"/g, ""));
  const question = processedArgs[0];
  // Unpacking the question choices into an array
  const questionChoices = [...new Set(processedArgs.slice(1))];
  if (questionChoices.length > questionPollChoices.length) {
    // Set a hard limit of 7 poll choices otherwise it becomes unwieldy
    return message.channel.send(`\u{1F626} You can only have ${questionPollChoices.length} options.`);
  }
  // Construct an embed for aesthetics
  const pollEmbed = new Discord.RichEmbed();
  pollEmbed.setColor("#FFFF00");
  pollEmbed.setTitle(question);
  for (let i = 0; i < questionChoices.length; i++) {
    pollEmbed.addField(questionPollChoices[i], questionChoices[i], true);
  }
  // Find the news channel to post the poll
  const newsChannel = discordClient.channels.find(ch => ch.name === config.discordNewsChannel);

  // Return question with choices as react emojis (letters A, B, etc.)
  await newsChannel.send("@everyone");
  return newsChannel.send(pollEmbed).then(async pollMessage => {
    for (let i = 0; i < questionChoices.length; i++) {
      await pollMessage.react(questionPollChoices[i]);
    }
  });
};

// Returns the list of available commands in an embed
const discordHelp = async ({ discordClient, message, args }) => {
  // Retrieving the allowed commands
  const allowedCommands = discordClient.commands.filter(command => command.hidden === false);
  // Setting up the embed to display the commands
  let embed = new Discord.RichEmbed().setColor("#15f153").setTitle("Command list");
  allowedCommands.forEach(allowedCommand => {
    embed.addField(`${config.commandPrefix}${allowedCommand.name}`, allowedCommand.description);
  });
  // Send the commands embed through
  return message.reply(embed);
};

// Fetch the ban list for Twitch channel
/* 
TODO:
const discordFetchBansForTwitch = async ({ discordClient, message, args }) => {
  await twitchGetBanList();
};
*/

module.exports = {
  discordNoStreamSendMessage,
  discordStreamLiveSendMessage,
  discordRebootMessage,
  discordAddRole,
  discordRemoveRole,
  discordAddLiveRole,
  discordRemoveLiveRole,
  discordStartPoll,
  discordHelp
};
