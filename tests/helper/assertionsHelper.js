/* istanbul ignore file */

exports.assertQueryCalled = (
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

exports.assertHttpResponseError = (
  response, statusCode, { error, status, message } = {}
) => {
  expect(response.statusCode).toBe(statusCode);

  const resJson = JSON.parse(response.payload);
  console.log('[assertionsHelper] response json:', resJson);

  if (error) {
    expect(resJson.error).toEqual(error);
  }

  if (status) {
    expect(resJson.status).toEqual(status);
  }

  if (message) {
    expect(resJson.message).toEqual(
      expect.stringContaining(message)
    );
  } else {
    expect(resJson.message).toEqual(expect.any(String));
    expect(resJson.message.trim()).not.toBe('');
  }
};