const { discordFetchBans } = require("../utils/discordUtils");
const { cmdGetLastTimeLiveOnTwitch } = require("../utils/commandUtils");

module.exports = {
  name: "lastlive",
  category: "streaming",
  description: "Gets the last time a channel was live (e.g., !lastlive MikamiHero)",
  hidden: false,
  run: async ({ discordClient, message, args }) => cmdGetLastTimeLiveOnTwitch({ discordClient, message, args })
};
