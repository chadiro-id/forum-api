const serverTest = require('../../../../tests/helper/ServerTestHelper');
const { createAuthToken } = require('../../../../tests/helper/authenticationHelper');
const { assertHttpResponseError } = require('../../../../tests/helper/assertionsHelper');
const pgTest = require('../../../../tests/helper/postgres');

beforeAll(async () => {
  await serverTest.init();
  await pgTest.truncate();
});

afterAll(async () => {
  await pgTest.end();
  await serverTest.stop();
});

describe('[Integration] Replies Endpoints', () => {
  let user;
  let authorization;
  let thread;
  let comment;

  beforeAll(async () => {
    user = await pgTest.users.add({ username: 'johndoe' });
    const { accessToken } = await createAuthToken({ ...user });
    authorization = { Authorization: `Bearer ${accessToken}` };
    thread = await pgTest.threads.add({ owner_id: user.id });
    comment = await pgTest.comments.add({ thread_id: thread.id, owner_id: user.id });
  });

  afterEach(async () => {
    await pgTest.replies.clean();
  });

  afterAll(async () => {
    await pgTest.comments.clean();
    await pgTest.threads.clean();
    await pgTest.users.clean();
  });

  describe('POST /threads/{threadId}/comments/{commentId}/replies', () => {
    let endpoint;

    beforeAll(async () => {
      endpoint = `/threads/${thread.id}/comments/${comment.id}/replies`;
    });

    it('should response 201 and persisted reply', async () => {
      const options = {
        headers: { ...authorization },
        payload: { content: 'Sebuah balasan' }
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data).toEqual(expect.any(Object));

      const addedReply = responseJson.data.addedReply;
      expect(addedReply).toEqual(expect.objectContaining({
        id: expect.stringContaining('reply-'),
        content: 'Sebuah balasan',
        owner: user.id,
      }));
    });

    it('should response 401 when request with no authentication', async () => {
      const options = { payload: { content: 'Sebuah balasan' } };
      const response = await serverTest.post(endpoint, options);

      assertHttpResponseError(response, 401, {
        status: null,
        error: 'Unauthorized',
        message: 'Missing authentication',
      });
    });

    it('should response 404 when thread not exists', async () => {
      const endpoint = `/threads/xxx/comments/${comment.id}/replies`;
      const options = {
        headers: { ...authorization },
        payload: { content: 'Sebuah balasan' },
      };

      const response = await serverTest.post(endpoint, options);

      assertHttpResponseError(response, 404);
    });

    it('should response 404 when comment not exists', async () => {
      const endpoint = `/threads/${thread.id}/comments/xxx/replies`;
      const options = {
        headers: { ...authorization },
        payload: { content: 'Sebuah balasan' },
      };

      const response = await serverTest.post(endpoint, options);

      assertHttpResponseError(response, 404);
    });

    it('should response 404 when comment not belong to thread', async () => {
      const otherThread = await pgTest.threads.add({ id: 'thread-999', owner_id: user.id });
      const endpoint = `/threads/${otherThread.id}/comments/${comment.id}/replies`;
      const options = {
        headers: { ...authorization },
        payload: { content: 'Sebuah balasan' },
      };

      const response = await serverTest.post(endpoint, options);

      assertHttpResponseError(response, 404);
    });

    it('should response 400 when payload not contain needed property', async () => {
      const options = {
        headers: { ...authorization },
        payload: { contents: 'Incorrect property name' }
      };

      const response = await serverTest.post(endpoint, options);

      assertHttpResponseError(response, 400);
    });

    it('should response 400 when payload has wrong data type', async () => {
      const options = {
        headers: { ...authorization },
        payload: { content: 123 }
      };

      const response = await serverTest.post(endpoint, options);

      assertHttpResponseError(response, 400);
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    let reply;

    beforeEach(async () => {
      reply = await pgTest.replies.add({ comment_id: comment.id, owner_id: user.id });
    });

    it('should response 200 and status "success"', async () => {
      const endpoint = `/threads/${thread.id}/comments/${comment.id}/replies/${reply.id}`;
      const options = {
        headers: { ...authorization }
      };

      const response = await serverTest.delete(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when request with no authentication', async () => {
      const endpoint = `/threads/${thread.id}/comments/${comment.id}/replies/${reply.id}`;

      const response = await serverTest.delete(endpoint);

      assertHttpResponseError(response, 401, {
        status: null,
        error: 'Unauthorized',
        message: 'Missing authentication',
      });
    });

    it('should response 404 when thread not exists', async () => {
      const endpoint = `/threads/xxx/comments/${comment.id}/replies/${reply.id}`;
      const options = {
        headers: { ...authorization }
      };

      const response = await serverTest.delete(endpoint, options);

      assertHttpResponseError(response, 404);
    });

    it('should response 404 when comment not exists', async () => {
      const endpoint = `/threads/${thread.id}/comments/xxx/replies/${reply.id}`;
      const options = {
        headers: { ...authorization }
      };

      const response = await serverTest.delete(endpoint, options);

      assertHttpResponseError(response, 404);
    });

    it('should response 404 when comment not belong to thread', async () => {
      const otherThread = await pgTest.threads.add({ id: 'thread-201', owner_id: user.id });
      const endpoint = `/threads/${otherThread.id}/comments/${comment.id}/replies/${reply.id}`;
      const options = {
        headers: { ...authorization }
      };

      const response = await serverTest.delete(endpoint, options);

      assertHttpResponseError(response, 404);
    });

    it('should response 404 when reply not exists', async () => {
      const endpoint = `/threads/${thread.id}/comments/${comment.id}/replies/xxx`;
      const options = {
        headers: { ...authorization }
      };

      const response = await serverTest.delete(endpoint, options);

      assertHttpResponseError(response, 404);
    });

    it('should response 404 when reply not belong to comment', async () => {
      const otherComment = await pgTest.comments.add({ id: 'comment-999', thread_id: thread.id, owner_id: user.id });

      const endpoint = `/threads/${thread.id}/comments/${otherComment.id}/replies/${reply.id}`;
      const options = {
        headers: { ...authorization }
      };

      const response = await serverTest.delete(endpoint, options);

      assertHttpResponseError(response, 404);
    });

    it('should response 403 when user not authorized', async () => {
      const { accessToken: otherAccessToken } = await createAuthToken({
        id: 'user-999', username: 'another-username'
      });
      const endpoint = `/threads/${thread.id}/comments/${comment.id}/replies/${reply.id}`;
      const options = {
        headers: { Authorization: `Bearer ${otherAccessToken}` },
      };

      const response = await serverTest.delete(endpoint, options);

      assertHttpResponseError(response, 403);
    });
  });
});