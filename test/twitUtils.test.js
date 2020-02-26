const { last24Hours } = require("../src/utils/twitUtils");
const moment = require("moment");

it("last24Hours - provided date is < 24 hours ago, so returns true", () => {
  const mockTweetDate = moment();
  expect(last24Hours({ tweetDate: mockTweetDate })).toBe(true);
});
