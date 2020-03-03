const { cmdGetLatestPBForUser } = require("../utils/commandUtils");

// Example usage !addrole @user <role>
module.exports = {
  name: "latestpb",
  category: "speedrun",
  description: "Gets a user's latest PB from speedrun.com (e.g., !latestPB <username>)",
  hidden: false,
  run: async ({ discordClient, message, args }) => cmdGetLatestPBForUser({ discordClient, message, args })
};
