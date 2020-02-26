const { discordStartPoll } = require("../utils/discordUtils");

// Example usage !addrole @user <role>
module.exports = {
  name: "startpoll",
  category: "admin",
  description: "starts a poll with message and choices",
  hidden: true,
  run: async ({ discordClient, message }) => discordStartPoll({ discordClient, message })
};
