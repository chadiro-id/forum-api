/* istanbul ignore file */
const ClientError = require('../../src/Commons/exceptions/ClientError');
require('../matcher/queryMatcher');

const assertQueryCalled = (
  poolQuery, queryText, queryValues
) => {
  expect(poolQuery).toHaveBeenCalledTimes(1);
  expect(poolQuery).toHaveBeenCalledWith({
    text: expect.toMatchQueryText(queryText),
    values: queryValues,
  });
};

const assertDBError = async (promise) => {
  await expect(promise).rejects.toThrow();
  await expect(promise).rejects.not.toThrow(ClientError);
};

module.exports = {
  assertQueryCalled,
  assertDBError,
};