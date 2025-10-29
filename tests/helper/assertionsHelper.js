/* istanbul ignore file */

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

const assertHttpResponseError = (
  response, statusCode, { status = 'fail', message = 'any' } = {}
) => {
  expect(response.statusCode).toBe(statusCode);

  const resJson = JSON.parse(response.payload);

  if (status) {
    expect(resJson.status).toEqual(status);
  }

  if (message === 'any') {
    expect(resJson.message).toEqual(expect.any(String));
    expect(resJson.message.trim()).not.toBe('');
  } else {
    expect(resJson.message).toEqual(
      expect.stringContaining(message)
    );
  }
};

const expectCommentFromResponse = (comment, expectedSource) => {
  const expectedContent = expectedSource.is_delete
    ? '**komentar telah dihapus**'
    : expectedSource.content;

  expect(comment.id).toEqual(expectedSource.id);
  expect(comment.content).toEqual(expectedContent);
  expect(comment.username).toEqual(expectedSource.username);
  expect(Date.parse(comment.date)).not.toBeNaN();
  expect(comment.replies).toHaveLength(expectedSource.replies.length);
};

const expectReplyFromResponse = (reply, expectedSource) => {
  const expectedContent = expectedSource.is_delete
    ? '**balasan telah dihapus**'
    : expectedSource.content;

  expect(reply.id).toEqual(expectedSource.id);
  expect(reply.content).toEqual(expectedContent);
  expect(reply.username).toEqual(expectedSource.username);
  expect(Date.parse(reply.date)).not.toBeNaN();
};

module.exports = {
  assertQueryCalled,
  assertHttpResponseError,
  expectCommentFromResponse,
  expectReplyFromResponse,
};