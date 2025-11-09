/* istanbul ignore file */
const ClientError = require('../../src/Commons/exceptions/ClientError');

const assertQueryCalled = (poolQuery, expectedQueryCalled) => {
  expect(poolQuery).toHaveBeenCalledTimes(1);
  expect(poolQuery).toHaveBeenCalledWith(expectedQueryCalled);
};

const assertDBError = async (promise) => {
  await expect(promise).rejects.toThrow();
  await expect(promise).rejects.not.toThrow(ClientError);
};

module.exports = {
  assertQueryCalled,
  assertDBError,
};