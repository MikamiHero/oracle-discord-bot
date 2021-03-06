const rp = require("request-promise");
const Fuse = require("fuse.js");

class speedrunAPIError extends Error {
  constructor(...args) {
    super(...args);
  }
}

const speedrunAPIBaseURL = "https://www.speedrun.com/api/v1";

// Hard-coded some game lookup values because I doubt the epheremal ID of the game will change
const speedrunGameLookup = [
  {
    id: "j1l9qz1g",
    name: "Zelda: Ocarina of Time",
    category: {
      "any%": "z275w5k0",
      noimww: "9d85yqdn",
      mst: "jdrwr0k6",
      noww: "xd1wj828",
      glitchless: "zd35jnkn",
      ganonless: "9kvr802g",
    },
  },
  { id: "o1y9wo6q", name: "Super Mario 64" },
  {
    id: "kdkjex1m",
    name: "Zelda: Ocarina of Time Master Quest",
    category: {
      "Child Dungeons": "8249jed5",
    },
  },
];

// const speedrunConstructReqData = { game };

const speedrunAPIRequest = async ({ options }) => rp(options);

const speedrunGetWRForGameAndCategory = async ({ game, category }) => {
  try {
    const gameInfo = await speedrunGetGameAndCategory({ game, category });
    // If no game got found, return null and the command will handle it accordingly
    if (!gameInfo.game) {
      return { game: null, category: null, weblink: null };
    }
    // If no category, pass the URL which should be included
    if (gameInfo.game && !gameInfo.category) {
      return { game: gameInfo.game, category: null, weblink: gameInfo.weblink };
    }

    const speedrunReqOptions = {
      uri: `${speedrunAPIBaseURL}/leaderboards/${gameInfo.game}/category/${gameInfo.category}`,
      qs: {
        top: 1,
      },
      json: true,
    };
    const wr = await speedrunAPIRequest({ options: speedrunReqOptions });
    return wr.data.runs[0].run;
  } catch (err) {
    throw new speedrunAPIError(err.message);
  }
};

const speedrunGetGameAndCategory = async ({ game, category }) => {
  try {
    // Setting up the options for the request
    const speedrunReqOptions = {
      uri: `${speedrunAPIBaseURL}/games`,
      qs: {
        name: game,
        embed: "categories",
      },
      json: true,
    };
    // Make the request to speedrun.com API
    const speedrunGameReq = await speedrunAPIRequest({ options: speedrunReqOptions });
    // If the game wasn't found, return null
    if (speedrunGameReq.data.length === 0) {
      return { game: null, category: null, weblink: null };
    }

    // Extract the first game ID for later
    const gameID = speedrunGameReq.data[0].id;
    // Storing the weblink for later as well
    const gameURL = speedrunGameReq.data[0].weblink;
    // Fuzzy search for category (taking the first entry from the game list)
    const categories = speedrunGameReq.data[0].categories.data;
    const fuzzyOptions = {
      keys: ["name"],
    };
    const fuse = new Fuse(categories, fuzzyOptions);
    const categoryFind = fuse.search(category);
    // If the category search turns up empty, give the user the page URL instead
    if (categoryFind.length === 0) {
      return { game: gameID, category: null, weblink: gameURL };
    }

    // Filter out individual levels
    const categoryFilter = categoryFind.filter((c) => c.type !== "per-level");

    // Grabbing the first entry's id
    const categoryID = categoryFilter[0].id;
    return { game: gameID, category: categoryID, weblink: gameURL };
  } catch (err) {
    throw new speedrunAPIError(err.message);
  }
};

const speedrunGetGame = async ({ game }) => {
  try {
    // Setting up the options for the request
    const speedrunReqOptions = {
      uri: `${speedrunAPIBaseURL}/games/${game}`,
      json: true,
    };
    // Make the request to speedrun.com API
    const speedrunGameReq = await speedrunAPIRequest({ options: speedrunReqOptions });
    // data->names->international is the string we want
    return speedrunGameReq.data.names.international;
  } catch (err) {
    throw new speedrunAPIError(err.message);
  }
};

const speedrunGetCategory = async ({ category }) => {
  try {
    // Setting up the options for the request
    const speedrunReqOptions = {
      uri: `${speedrunAPIBaseURL}/categories/${category}`,
      json: true,
    };
    // Make the request to speedrun.com API
    const speedrunCategoryReq = await speedrunAPIRequest({ options: speedrunReqOptions });
    // data.name is the property we want
    return speedrunCategoryReq.data.name;
  } catch (err) {
    throw new speedrunAPIError(err.message);
  }
};

const speedrunGetUsernameFromID = async ({ userID }) => {
  // Setting up the options for request
  const speedrunReqOptions = {
    uri: `${speedrunAPIBaseURL}/users/${userID}`,
    json: true,
  };

  try {
    // Making the requets to retrieve username based on ID
    const speedrunUsernameReq = await speedrunAPIRequest({ options: speedrunReqOptions });
    // Checking if the data property of the return object has more than one entry
    if (speedrunUsernameReq.data.length > 1 || speedrunUsernameReq.data.length === 0) {
      // If it has more than one entry or no entry, return null
      return null;
    }
    // Return the matching username
    return speedrunUsernameReq.data.names.international;
  } catch (err) {
    throw new speedrunAPIError(err.message);
  }
};

const speedrunGetUserID = async ({ username }) => {
  // Setting up the options for request
  const speedrunReqOptions = {
    uri: `${speedrunAPIBaseURL}/users/${username}`,
    json: true,
  };

  try {
    // Making the requets to retrieve user ID based on username
    const speedrunUserIDReq = await speedrunAPIRequest({ options: speedrunReqOptions });
    // Return the matching user's id
    return speedrunUserIDReq.data.id;
  } catch (err) {
    // If it's a 404, simply return null and inform the user the user could not be found. Else log everything else
    if (err.statusCode === 404) {
      return null;
    }
    throw new speedrunAPIError(err.message);
  }
};

const speedrunGetLatestPBForUser = async ({ userID }) => {
  try {
    // Setting up options to make the latest PB request from speedrun.com
    const speedrunReqOptions = {
      uri: `${speedrunAPIBaseURL}/users/${userID}/personal-bests`,
      json: true,
    };
    // Make the request to speedrun.com API
    const speedrunPBReq = await speedrunAPIRequest({ options: speedrunReqOptions });
    // If the data property is empty, return null
    if (!speedrunPBReq.data || speedrunPBReq.data.length === 0) {
      return null;
    }
    // Plucking out the first entry in the list (the API returns entries in date order desc)
    let latestSpeedrunPB = speedrunPBReq.data[0];
    // Passing the game's ID to look up string name
    const gameName = await speedrunGetGame({ game: latestSpeedrunPB.run.game });
    // Passing the category ID to look up string name
    const categoryName = await speedrunGetCategory({ category: latestSpeedrunPB.run.category });
    // Using the display name for game and category
    latestSpeedrunPB.run.game = gameName;
    latestSpeedrunPB.run.category = categoryName;
    return latestSpeedrunPB;
  } catch (err) {
    throw new speedrunAPIError(err.message);
  }
};

module.exports = {
  speedrunGetWRForGameAndCategory,
  speedrunGetLatestPBForUser,
  speedrunGetUserID,
  speedrunGetUsernameFromID,
};
