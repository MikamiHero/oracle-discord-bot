const { discordHelp } = require("../utils/discordUtils");
module.exports = {
  name: "help",
  category: "info",
  description: "Returns an embed with all the available commands",
  hidden: false,
  run: async ({ discordClient, message, args }) => discordHelp({ discordClient, message, args })
};
