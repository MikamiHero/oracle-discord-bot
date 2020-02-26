const { discordFetchBans } = require("../utils/discordUtils");

module.exports = {
  name: "banlist",
  category: "moderation",
  description: "Gets the current ban list",
  hidden: true,
  run: async ({ discordClient, message, args }) => discordFetchBans({ discordClient, message, args })
};
