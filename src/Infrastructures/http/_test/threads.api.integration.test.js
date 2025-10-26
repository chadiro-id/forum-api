const pool = require('../../database/postgres/pool');
const serverTest = require('../../../../tests/helper/ServerTestHelper');
const { createAuthToken } = require('../../../../tests/helper/authenticationHelper');
const { assertHttpResponseError } = require('../../../../tests/helper/assertionsHelper');
const {
  usersTable,
  authenticationsTable,
  threadsTable,
  commentsTable,
  repliesTable,
} = require('../../../../tests/helper/postgres');

let userA;
let userB;
let userAuthA;

beforeAll(async () => {
  await serverTest.init();
  userA = await usersTable.add({ id: 'user-001', username: 'whoami' });
  userAuthA = await createAuthToken({ ...userA });
  userB = await usersTable.add({ id: 'user-002', username: 'johndoe' });
});

afterAll(async () => {
  await authenticationsTable.clean();
  await usersTable.clean();
  await pool.end();
  await serverTest.stop();
});

describe('[Integration] Threads Endpoints', () => {
  let authorizationUserA;

  beforeAll(async () => {
    authorizationUserA = {
      Authorization: `Bearer ${userAuthA.accessToken}`
    };
  });

  describe('POST /threads', () => {
    const dummyPayload = {
      title: 'Judul thread',
      body: 'Sebuah thread',
    };

    it('should response 201 and return persisted thread', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: { ...dummyPayload },
      };

      const response = await serverTest.post('/threads', options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data).toHaveProperty('addedThread');
      expect(responseJson.data.addedThread).toMatchObject({
        id: expect.stringContaining('thread-'),
        title: dummyPayload.title,
        owner: userA.id,
      });
    });

    it('should response 401 when request with no authentication', async () => {
      const options = { payload: { ...dummyPayload } };
      const response = await serverTest.post('/threads', options);

      assertHttpResponseError(response, 401, {
        status: null,
        error:'Unauthorized',
        message: 'Missing authentication'
      });
    });

    it('should response 400 when payload not contain needed property', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: {}
      };

      const response = await serverTest.post('/threads', options);

      assertHttpResponseError(response, 400);
    });

    it('should response 400 when payload does not meet data type specification', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: { ...dummyPayload, body: 123 },
      };

      const response = await serverTest.post('/threads', options);

      assertHttpResponseError(response, 400);
    });

    it('should response 400 when thread title more than 255 character', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: { ...dummyPayload, title: 'a'.repeat(256) },
      };

      const response = await serverTest.post('/threads', options);

      assertHttpResponseError(response, 400);
    });
  });

  describe('GET /threads/{threadId}', () => {
    let thread;

    beforeEach(async () => {
      thread = await threadsTable.add({ owner_id: userA.id });
    });

    afterEach(async () => {
      await repliesTable.clean();
      await commentsTable.clean();
      await threadsTable.clean();
    });

    it('should response 200 and detail thread', async () => {
      const response = await serverTest.get(`/threads/${thread.id}`);

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();

      const detailThread = responseJson.data.thread;
      expect(detailThread).toMatchObject({
        id: expect.stringContaining('thread-'),
        title: 'Sebuah thread',
        body: 'Isi thread',
        username: userA.username,
      });
      expect(Date.parse(detailThread.date)).not.toBeNaN();
      expect(detailThread.comments).toHaveLength(0);
    });

    it('should handle all comments including soft-deleted ones', async () => {
      const commentA = await commentsTable.add({ id: 'comment-001', thread_id: thread.id, owner_id: userA.id });
      const commentB = await commentsTable.add({ id: 'comment-002', thread_id: thread.id, owner_id: userB.id, is_delete: true });

      const response = await serverTest.get(`/threads/${thread.id}`);

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();

      const comments = responseJson.data.thread.comments;
      expect(comments).toHaveLength(2);

      const c1 = comments.find((c) => c.id === commentA.id);
      const c2 = comments.find((c) => c.id === commentB.id);

      expect(c1).toMatchObject({
        id: commentA.id,
        content: 'Sebuah komentar',
        username: userA.username,
      });
      expect(Date.parse(c1.date)).not.toBeNaN();

      expect(c2).toMatchObject({
        id: commentB.id,
        content: '**komentar telah dihapus**',
        username: userB.username,
      });
      expect(Date.parse(c2.date)).not.toBeNaN();
    });

    it('should handle all replies including soft-deleted ones', async () => {
      const comment = await commentsTable.add({ id: 'comment-001', thread_id: thread.id, owner_id: userA.id });
      const replyA = await repliesTable.add({ id: 'reply-001', comment_id: comment.id, owner_id: userB.id });
      const replyB = await repliesTable.add({ id: 'reply-002', comment_id: comment.id, owner_id: userA.id, is_delete: true });

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

      expect(r1).toMatchObject({
        id: replyA.id,
        content: replyA.content,
        username: userB.username,
      });
      expect(Date.parse(r1.date)).not.toBeNaN();

      expect(r2).toMatchObject({
        id: replyB.id,
        content: '**balasan telah dihapus**',
        username: userA.username,
      });
      expect(Date.parse(r2.date)).not.toBeNaN();
    });
  });
});