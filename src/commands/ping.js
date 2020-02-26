module.exports = {
  name: "ping",
  category: "info",
  description: "Returns latency and API ping",
  hidden: false,
  run: async ({ discordClient, message, args }) => {
    const msg = await message.channel.send("Pinging...");

    msg.edit(
      `\nLatency is ${Math.floor(msg.createdAt - message.createdAt)}ms\nAPI latency is ${Math.fround(
        discordClient.ping
      )}ms`
    );
  }
};
