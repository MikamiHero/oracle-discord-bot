const { cmdGetWRForGameAndCategory } = require("../utils/commandUtils");

// Example usage !addrole @user <role>
module.exports = {
  name: "wr",
  category: "speedrun",
  description: `Gets the WR for a game and category from speedrun.com (e.g., !wr "Pokemon Sword" "Any%")`,
  hidden: false,
  run: async ({ discordClient, message, args }) => {
    const pleaseWaitMessage = await message.channel.send("Checking...");
    return cmdGetWRForGameAndCategory({ discordClient, message, args });
  },
};
