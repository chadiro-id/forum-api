const serverTest = require('../../../../tests/helper/ServerTestHelper');
const pgTest = require('../../../../tests/helper/postgres');
const { createAuthToken } = require('../../../../tests/helper/authenticationHelper');

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
      expect(response.statusCode).toBe(201);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'success',
        data: {
          addedThread: {
            id: expect.stringMatching(/^thread-[A-Za-z0-9_-]{21}$/),
            title: dummyPayload.title,
            owner: user.id,
          }
        }
      });
    });

    it('should response 401 when request with no authentication', async () => {
      const options = { payload: { ...dummyPayload } };

      const response = await serverTest.post('/threads', options);
      expect(response.statusCode).toBe(401);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Missing authentication'
      });
    });

    it('should response 400 when payload not contain needed property', async () => {
      const options = {
        headers: { ...authorization },
        payload: {}
      };

      const response = await serverTest.post('/threads', options);
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: '"Judul thread" wajib diisi',
      });
    });

    it('should response 400 when payload does not meet data type specification', async () => {
      const options = {
        headers: { ...authorization },
        payload: { ...dummyPayload, body: 123 },
      };

      const response = await serverTest.post('/threads', options);
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: '"Bodi thread" harus berupa teks',
      });
    });

    it('should response 400 when thread title more than 255 character', async () => {
      const options = {
        headers: { ...authorization },
        payload: { ...dummyPayload, title: 'a'.repeat(256) },
      };

      const response = await serverTest.post('/threads', options);
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: '"Judul thread" maksimal 255 karakter',
      });
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
      const expectedResJson = {
        status: 'success',
        data: {
          thread: {
            id: thread.id,
            title: thread.title,
            body: thread.body,
            username: user.username,
            date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/),
            comments: [],
          },
        },
      };

      const response = await serverTest.get(`/threads/${thread.id}`);
      expect(response.statusCode).toBe(200);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual(expectedResJson);
    });

    it('should handle all comments including soft-deleted ones', async () => {
      const commentA = await pgTest.comments.add({ id: 'comment-001', thread_id: thread.id, owner_id: user.id });
      const commentB = await pgTest.comments.add({ id: 'comment-002', thread_id: thread.id, owner_id: user.id, is_delete: true });

      const response = await serverTest.get(`/threads/${thread.id}`);
      expect(response.statusCode).toBe(200);

      const resJson = JSON.parse(response.payload);
      const comments = resJson.data.thread.comments;
      expect(comments).toStrictEqual([
        {
          id: commentA.id,
          content: commentA.content,
          username: user.username,
          date: commentA.created_at.toISOString(),
          replies: [],
        },
        {
          id: commentB.id,
          content: '**komentar telah dihapus**',
          username: user.username,
          date: commentB.created_at.toISOString(),
          replies: [],
        }
      ]);
    });

    it('should handle all replies including soft-deleted ones', async () => {
      const comment = await pgTest.comments.add({ id: 'comment-001', thread_id: thread.id, owner_id: user.id });
      const replyA = await pgTest.replies.add({ id: 'reply-001', comment_id: comment.id, owner_id: user.id });
      const replyB = await pgTest.replies.add({ id: 'reply-002', comment_id: comment.id, owner_id: user.id, is_delete: true });

      const response = await serverTest.get(`/threads/${thread.id}`);
      expect(response.statusCode).toBe(200);

      const resJson = JSON.parse(response.payload);

      const comments = resJson.data.thread.comments;
      expect(comments).toHaveLength(1);

      const replies = comments[0].replies;
      expect(replies).toStrictEqual([
        {
          id: replyA.id,
          content: replyA.content,
          username: user.username,
          date: replyA.created_at.toISOString(),
        },
        {
          id: replyB.id,
          content: '**balasan telah dihapus**',
          username: user.username,
          date: replyB.created_at.toISOString(),
        },
      ]);
    });
  });
});