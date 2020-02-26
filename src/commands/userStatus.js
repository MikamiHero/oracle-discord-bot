const config = require("../config");
const manageMembers = "MANAGE_MEMBERS";

module.exports = {
  name: "userstatus",
  category: "info",
  description: "Gets the status of a user",
  hidden: true,
  run: async ({ discordClient, message, args }) => {
    // Example usage !userstatus @user

    // Need to make sure member has permissions to check user's status
    if (!message.member.hasPermission([manageMembers])) {
      return message.reply("\u{1F626} Sorry, mate. You don't have permissions!");
    }
    // Extract the user
    const discordMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!discordMember) {
      return message.reply("User couldn't be found...");
    }

    console.log(discordMember.presence);

    return;

    // console.log(discordMember.user);

    // // Only going to handle switching for anything to livestreaming and back
    // const memberGameStatus = discordMember.presence.game;
    // if (!memberGameStatus) {
    //   return;
    // }

    // // console.log(roleMember.presence);
    // // console.log(roleMember.presence.game);
    // // console.log(roleMember.presence.game.streaming);
    // // // ID is always 22 chars
    // // const role = args.join(" ").slice(22);
    // // if (!role) {
    // //   return message.reply("Please specify a role!");
    // // }
    // // // Finding the respective role to add
    // // const guildRole = message.guild.roles.find(x => x.name === role);
    // // if (!guildRole) {
    // // }
    // // Finding the logs channel
    // const botLogChannel = discordClient.channels.find(ch => ch.name === config.discordBotLogChannel);

    // // // If the user doesn't have the role, it means it's been removed already
    // // if (!roleMember.roles.has(guildRole.id)) {
    // //   const message = `:stuck_out_tongue: ${roleMember} already has role ${guildRole} removed`;
    // //   return botLogChannel.send(message);
    // // }

    // // Remove role
    // try {
    //   //   await roleMember.removeRole(guildRole.id);
    //   const message = `:thumbsup: ${discordMember} is here`;
    //   return botLogChannel.send(message);
    //   return;
    // } catch (err) {
    //   console.error(err);
    // }
  }
};
