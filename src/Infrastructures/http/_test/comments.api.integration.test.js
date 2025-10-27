// const pool = require('../../database/postgres/pool');
const serverTest = require('../../../../tests/helper/ServerTestHelper');
const pgTest = require('../../../../tests/helper/postgres');
const { createAuthToken } = require('../../../../tests/helper/authenticationHelper');
const { assertHttpResponseError } = require('../../../../tests/helper/assertionsHelper');
// const {
//   usersTable,
//   threadsTable,
//   commentsTable,
// } = require('../../../../tests/helper/postgres');

beforeAll(async () => {
  await serverTest.init();
});

afterAll(async () => {
  // await usersTable.clean();
  // await commentsTable.clean();
  // await threadsTable.clean();
  // await pool.end();
  await pgTest.end();
  await serverTest.stop();
});

describe('[Integration] Comments Endpoints', () => {
  beforeEach(async () => {
    // await commentsTable.clean();
    // await threadsTable.clean();
    await pgTest.truncate();
  });

  describe('POST /threads/{threadId}/comments', () => {
    let user;
    let authorization;
    let thread;
    let endpoint;

    // beforeAll(async () => {
    // });

    beforeEach(async () => {
      user = await pgTest.users().add({ username: 'johndoe' });
      const { accessToken } = await createAuthToken({ ...user });
      authorization = {
        Authorization: `Bearer ${accessToken}`,
      };
      thread = await pgTest.threads().add({ owner_id: user.id });
      endpoint = `/threads/${thread.id}/comments`;
    });

    // afterAll(async () => {
    //   await usersTable.clean();
    // });

    it('should response 201 and persisted comment', async () => {
      const options = {
        headers: { ...authorization },
        payload: { content: 'Sebuah komentar' },
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toEqual(expect.any(Object));

      const addedComment = responseJson.data.addedComment;
      expect(addedComment).toEqual(expect.objectContaining({
        id: expect.stringContaining('comment-'),
        content: 'Sebuah komentar',
        owner: user.id,
      }));
    });

    it('should response 401 when request with no authentications', async () => {
      const options = { payload: { content: 'Sebuah komentar' } };
      const response = await serverTest.post(endpoint, options);

      assertHttpResponseError(response, 401, {
        status: null,
        error: 'Unauthorized',
        message: 'Missing authentication',
      });
    });

    it('should response 404 when thread not exists', async () => {
      const options = {
        headers: { ...authorization },
        payload: { content: 'Sebuah komentar' },
      };

      const response = await serverTest.post('/threads/xxx/comments', options);

      assertHttpResponseError(response, 404);
    });

    it('should response 400 when payload not contain needed property', async () => {
      const options = {
        headers: { ...authorization },
        payload: { contents: 'Incorrect content property' },
      };

      const response = await serverTest.post(endpoint, options);

      assertHttpResponseError(response, 400);
    });

    it('should response 400 when payload has wrong data type', async () => {
      const options = {
        headers: { ...authorization },
        payload: { content: ['Sebuah komentar'] },
      };

      const response = await serverTest.post(endpoint, options);

      assertHttpResponseError(response, 400);
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    let user;
    let authorization;
    let thread;
    let comment;

    // beforeAll(async () => {
    //   user = await pgTest.users.add({ username: 'johndoe' });
    //   const { accessToken } = await createAuthToken({ ...user });
    //   authorization = {
    //     Authorization: `Bearer ${accessToken}`,
    //   };
    // });

    beforeEach(async () => {
      user = await pgTest.users().add({ username: 'johndoe' });
      const { accessToken } = await createAuthToken({ ...user });
      authorization = {
        Authorization: `Bearer ${accessToken}`,
      };
      thread = await pgTest.threads().add({ owner_id: user.id });
      comment = await pgTest.comments().add({ thread_id: thread.id, owner_id: user.id });
    });

    // afterAll(async () => {
    //   await usersTable.clean();
    // });

    it('should response 200 and status "success"', async () => {
      const endpoint = `/threads/${thread.id}/comments/${comment.id}`;
      const options = { headers: { ...authorization } };

      const response = await serverTest.delete(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when request with no authentication', async () => {
      const endpoint = `/threads/${thread.id}/comments/${comment.id}`;
      const response = await serverTest.delete(endpoint);

      assertHttpResponseError(response, 401, {
        status: null,
        error: 'Unauthorized',
        message: 'Missing authentication',
      });
    });

    it('should response 404 when thread not exists', async () => {
      const endpoint = `/threads/xxx/comments/${comment.id}`;
      const options = { headers: { ...authorization } };

      const response = await serverTest.delete(endpoint, options);

      assertHttpResponseError(response, 404);
    });

    it('should response 404 when comment not exists', async () => {
      const endpoint = `/threads/${thread.id}/comments/xxx`;
      const options = { headers: { ...authorization } };

      const response = await serverTest.delete(endpoint, options);

      assertHttpResponseError(response, 404);
    });

    it('should response 404 when comment not belong to thread', async () => {
      const otherThread = await pgTest.threads().add({ id: 'thread-999', owner_id: user.id });

      const endpoint = `/threads/${otherThread.id}/comments/${comment.id}`;
      const options = { headers: { ...authorization } };

      const response = await serverTest.delete(endpoint, options);

      assertHttpResponseError(response, 404);
    });

    it('should response 403 when user not authorized', async () => {
      const { accessToken: otherAccessToken } = await createAuthToken({
        id: 'user-999', username: 'another-username'
      });

      const endpoint = `/threads/${thread.id}/comments/${comment.id}`;
      const options = { headers: { Authorization: `Bearer ${otherAccessToken}` } };

      const response = await serverTest.delete(endpoint, options);

      assertHttpResponseError(response, 403);
    });
  });
});