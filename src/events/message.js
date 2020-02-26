const config = require("../config");

// This file is effectively client.on("message",...)

module.exports = (client, message) => {
  // Ignore all bots
  if (message.author.bot) return;

  // Ignore messages not starting with the prefix (in config.json)
  if (message.content.indexOf(config.commandPrefix) !== 0) return;

  // Our standard argument/command name definition.
  const args = message.content
    .slice(config.commandPrefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  // Grab the command data from the client.commands Enmap
  const cmd = client.commands.get(command);

  // If that command doesn't exist, silently exit and do nothing
  if (!cmd) {
    return message.reply("Command does not exist!");
  }

  // Run the command
  cmd.run({ discordClient: client, message: message, args: args });
};
