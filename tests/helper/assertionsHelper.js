/* istanbul ignore file */
const ClientError = require('../../src/Commons/exceptions/ClientError');

const assertQueryCalled = (
  query, queryTextPart, queryValues
) => {
  expect(query).toHaveBeenCalledTimes(1);
  expect(query).toHaveBeenCalledWith(
    expect.objectContaining({
      text: expect.stringContaining(queryTextPart),
      values: queryValues,
    })
  );
};

const assertDBError = async (promise) => {
  await expect(promise).rejects.toThrow();
  await expect(promise).rejects.not.toThrow(ClientError);
};

module.exports = {
  assertQueryCalled,
  assertDBError,
};