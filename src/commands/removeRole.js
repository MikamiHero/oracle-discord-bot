const { discordRemoveRole } = require("../utils/discordUtils");

// Example usage !removerole @user <role>
module.exports = {
  name: "removerole",
  category: "roleManagement",
  description: "Removes a role to a user in the server",
  hidden: true,
  run: async ({ discordClient, message, args }) => discordRemoveRole({ discordClient, message, args })
};
