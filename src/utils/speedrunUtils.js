const rp = require("request-promise");

class speedrunAPIError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

const speedrunAPIBaseURL = "speedrun.com/api/v1";
const speedrunGameLookup = {
  oot: {
    id: "j1l9qz1g",
    category: {
      "any%": "z275w5k0",
      noimww: "9d85yqdn",
      mst: "jdrwr0k6",
      noww: "xd1wj828",
      glitchless: "zd35jnkn",
      ganonless: "9kvr802g"
    }
  },
  sm64: { id: "o1y9wo6q" }
};

// const speedrunConstructReqData = { game };

const speedrunAPIRequest = async ({ options }) => {
  try {
    return await rp(options);
  } catch (err) {
    throw new speedrunAPIError(err.message);
  }
};

const speedrunGetWRForGameAndCategory = async ({ game, category }) => {
  const gameId = speedrunGameLookup[game] ? speedrunGameLookup[game].id : null;
  if (!gameId) {
    throw new speedrunAPIError("The game you provided does not exist in Oracle's list!");
  }
  try {
    const categoryId = speedrunGameLookup[game].category[category];
    const speedrunReqOptions = {
      uri: `https://www.${speedrunAPIBaseURL}/leaderboards/${gameId}/category/${categoryId}`,
      qs: {
        top: 1
      },
      json: true
    };
    const wr = await speedrunAPIRequest({ options: speedrunReqOptions });
    console.log(wr.data.runs[0].run);
  } catch (err) {
    throw new speedrunAPIError(err.message);
  }
};

module.exports = { speedrunGetWRForGameAndCategory };
