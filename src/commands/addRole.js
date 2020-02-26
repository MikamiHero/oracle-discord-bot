const { discordAddRole } = require("../utils/discordUtils");

// Example usage !addrole @user <role>
module.exports = {
  name: "addrole",
  category: "roleManagement",
  description: "Adds a role to a user in the server",
  hidden: true,
  run: async ({ discordClient, message, args }) => discordAddRole({ discordClient, message, args })
};
