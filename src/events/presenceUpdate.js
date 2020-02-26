const config = require("../config");
const { discordAddLiveRole, discordRemoveLiveRole } = require("../utils/discordUtils");

// This file is effectively client.on("presenceUpdate",...)
// oldMember is before status update, newMember is after status update
module.exports = async (client, oldMember, newMember) => {
  return;
  // // Setting up variables
  // const userId = oldMember.user.id;
  // // If the person is going online, add role
  // if (newMember.presence.game) {
  //   // The reason for the nested IF is 'game' property can be 'null', and we need to check game.streaming
  //   if (newMember.presence.game.streaming) {
  //     await discordAddLiveRole({ discordClient: client, userId: userId });
  //   }
  // }
  // // If the person is going offline, remove role
  // else if (oldMember.presence.game) {
  //   // Same as above for nested
  //   if (oldMember.presence.game.streaming) {
  //     await discordRemoveLiveRole({ discordClient: client, userId: userId });
  //   }
  // }
  // The above logic means if the presence change is NOT game related, it'll just skip
};
