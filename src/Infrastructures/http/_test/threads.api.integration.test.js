const serverTest = require('../../../../tests/helper/ServerTestHelper');
const pgTest = require('../../../../tests/helper/postgres');
const { createAuthToken } = require('../../../../tests/helper/authenticationHelper');
const {
  assertHttpResponseError,
  expectCommentFromResponse,
  expectReplyFromResponse,
} = require('../../../../tests/helper/assertionsHelper');

beforeAll(async () => {
  await serverTest.init();
  await pgTest.truncate();
});

afterAll(async () => {
  await pgTest.end();
  await serverTest.stop();
});

describe('[Integration] Threads Endpoints', () => {
  let user;

  beforeAll(async () => {
    user = await pgTest.users.add({ username: 'johndoe' });
  });

  afterAll(async () => {
    await pgTest.users.clean();
  });

  describe('POST /threads', () => {
    const dummyPayload = {
      title: 'Judul thread',
      body: 'Sebuah thread',
    };
    let authorization;

    beforeAll(async () => {
      const { accessToken } = await createAuthToken({ ...user });
      authorization = {
        Authorization: `Bearer ${accessToken}`,
      };
    });

    it('should response 201 and return persisted thread', async () => {
      const options = {
        headers: { ...authorization },
        payload: { ...dummyPayload },
      };

      const response = await serverTest.post('/threads', options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.addedThread).toEqual(
        expect.objectContaining({
          id: expect.stringContaining('thread-'),
          title: dummyPayload.title,
          owner: user.id,
        })
      );
    });

    it('should response 401 when request with no authentication', async () => {
      const options = { payload: { ...dummyPayload } };
      const response = await serverTest.post('/threads', options);

      assertHttpResponseError(response, 401, {
        status: null,
        message: 'Missing authentication',
      });
    });

    it('should response 400 when payload not contain needed property', async () => {
      const options = {
        headers: { ...authorization },
        payload: {}
      };

      const response = await serverTest.post('/threads', options);

      assertHttpResponseError(response, 400);
    });

    it('should response 400 when payload does not meet data type specification', async () => {
      const options = {
        headers: { ...authorization },
        payload: { ...dummyPayload, body: 123 },
      };

      const response = await serverTest.post('/threads', options);

      assertHttpResponseError(response, 400);
    });

    it('should response 400 when thread title more than 255 character', async () => {
      const options = {
        headers: { ...authorization },
        payload: { ...dummyPayload, title: 'a'.repeat(256) },
      };

      const response = await serverTest.post('/threads', options);

      assertHttpResponseError(response, 400);
    });
  });

  describe('GET /threads/{threadId}', () => {
    let thread;

    beforeAll(async () => {
      thread = await pgTest.threads.add({ owner_id: user.id });
    });

    afterEach(async () => {
      await pgTest.replies.clean();
      await pgTest.comments.clean();
    });

    afterAll(async () => {
      await pgTest.threads.clean();
    });

    it('should response 200 and detail thread', async () => {
      const response = await serverTest.get(`/threads/${thread.id}`);

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();

      const detailThread = responseJson.data.thread;
      expect(detailThread).toMatchObject({
        id: thread.id,
        title: thread.title,
        body: thread.body,
        username: user.username,
      });
      expect(Date.parse(detailThread.date)).not.toBeNaN();
      expect(detailThread.comments).toHaveLength(0);
    });

    it('should handle all comments including soft-deleted ones', async () => {
      const commentA = await pgTest.comments.add({ id: 'comment-001', thread_id: thread.id, owner_id: user.id });
      const commentB = await pgTest.comments.add({ id: 'comment-002', thread_id: thread.id, owner_id: user.id, is_delete: true });

      const response = await serverTest.get(`/threads/${thread.id}`);

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();

      const comments = responseJson.data.thread.comments;
      expect(comments).toHaveLength(2);

      const c1 = comments.find((c) => c.id === commentA.id);
      const c2 = comments.find((c) => c.id === commentB.id);
      expectCommentFromResponse(c1, { ...commentA, username: user.username, replies: [] });
      expectCommentFromResponse(c2, { ...commentB, username: user.username, replies: [] });
    });

    it('should handle all replies including soft-deleted ones', async () => {
      const comment = await pgTest.comments.add({ id: 'comment-001', thread_id: thread.id, owner_id: user.id });
      const replyA = await pgTest.replies.add({ id: 'reply-001', comment_id: comment.id, owner_id: user.id });
      const replyB = await pgTest.replies.add({ id: 'reply-002', comment_id: comment.id, owner_id: user.id, is_delete: true });

      const response = await serverTest.get(`/threads/${thread.id}`);

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();

      const comments = responseJson.data.thread.comments;
      expect(comments).toHaveLength(1);

      const replies = comments[0].replies;
      expect(replies).toHaveLength(2);

      const r1 = replies.find((r) => r.id === replyA.id);
      const r2 = replies.find((r) => r.id === replyB.id);
      expectReplyFromResponse(r1, { ...replyA, username: user.username });
      expectReplyFromResponse(r2, { ...replyB, username: user.username });
    });
  });
});