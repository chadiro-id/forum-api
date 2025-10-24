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
  response, statusCode, json = {}
) => {
  const resJson = JSON.parse(response.payload);
  expect(response.statusCode).toBe(statusCode);
  expect(resJson.status).toEqual(json.status || 'fail');
  if (json.message) {
    expect(resJson.message).toEqual(
      expect.stringContaining(json.message)
    );
  } else {
    expect(resJson.message).toEqual(expect.any(String));
    expect(resJson.message.trim()).not.toBe('');
  }
};