const pool = require('../../database/postgres/pool');
const serverTest = require('../../../../tests/helper/ServerTestHelper');
const { getUserAuth } = require('../../../../tests/server/helper');
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
let userAuthB;

beforeAll(async () => {
  await serverTest.setup();
  userA = await usersTable.add({ id: 'user-123', username: 'whoami' });
  userAuthA = await getUserAuth({ ...userA });
  userB = await usersTable.add({ id: 'user-456', username: 'johndoe' });
  userAuthB = await getUserAuth({ ...userB });
});

afterAll(async () => {
  await authenticationsTable.clean();
  await usersTable.clean();
  await pool.end();
});

describe('Threads Endpoints', () => {
  let authorizationUserA;
  let authorizationUserB;

  beforeAll(async () => {
    authorizationUserA = {
      Authorization: `Bearer ${userAuthA.accessToken}`
    };
    authorizationUserB = {
      Authorization: `Bearer ${userAuthB.accessToken}`
    };
  });

  beforeEach(async () => {
    await serverTest.init();
  });

  afterEach(async () => {
    await serverTest.stop();
  });

  describe('POST /threads', () => {
    const dummyPayload = {
      title: 'Judul thread',
      body: 'Sebuah thread',
    };

    it('should response 401 when request with no authentication', async () => {
      const options = {
        payload: { ...dummyPayload }
      };

      const response = await serverTest.post('/threads', options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: {}
      };

      const response = await serverTest.post('/threads', options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message).not.toBe('');
    });

    it('should response 400 when request payload does not meet data type specification', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: { ...dummyPayload, body: 123 },
      };

      const response = await serverTest.post('/threads', options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message).not.toBe('');
    });

    it('should response 400 when thread title more than 255 character', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: { ...dummyPayload, title: 'Sebuah Thread'.repeat(102) },
      };

      const response = await serverTest.post('/threads', options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message).not.toBe('');
    });

    it('should response 201 and return the persisted thread', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: { ...dummyPayload },
      };

      const response = await serverTest.post('/threads', options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data).toHaveProperty('addedThread');
      expect(responseJson.data.addedThread).toEqual({
        id: expect.stringContaining('thread-'),
        title: dummyPayload.title,
        owner: userA.id,
      });
    });
  });

  describe('GET /threads/{threadId}', () => {
    let threadId;
    let commentId1;
    let commentId2;
    let replyId2;

    beforeAll(async () => {
      threadId = await threadsTable.add({ owner: userA.id });
      commentId1 = await commentsTable.add({ id: 'comment-123', threadId, owner: userA.id });
      commentId2 = await commentsTable.add({ id: 'comment-456', threadId, owner: userB.id });
      await repliesTable.add({ id: 'reply-123', commentId: commentId1, owner: userB.id });
      replyId2 = await repliesTable.add({ id: 'reply-456', commentId: commentId1, owner: userA.id });
    });

    afterAll(async () => {
      await repliesTable.clean();
      await commentsTable.clean();
      await threadsTable.clean();
    });

    it('should response 200 and detail thread', async () => {
      const response = await serverTest.get(`/threads/${threadId}`);

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.id).toEqual(expect.stringContaining('thread-'));
      expect(responseJson.data.thread.id).not.toBe('');
      expect(responseJson.data.thread.title).toEqual('Sebuah thread');
      expect(responseJson.data.thread.body).toEqual('Isi thread');
      expect(Date.parse(responseJson.data.thread.date)).not.toBeNaN();
      expect(responseJson.data.thread.username).toBe(userA.username);
      expect(responseJson.data.thread.comments).toEqual(expect.any(Array));
      expect(responseJson.data.thread.comments).toHaveLength(2);

      const [comment1, comment2] = responseJson.data.thread.comments;

      expect(comment1).toEqual(expect.any(Object));
      expect(comment1.id).toEqual('comment-123');
      expect(comment1.username).toEqual(userA.username);
      expect(comment1.content).toEqual('Sebuah komentar');
      expect(Date.parse(comment1.date)).not.toBeNaN();
      expect(comment1.replies).toEqual(expect.any(Array));
      expect(comment1.replies).toHaveLength(2);
      expect(comment1.replies).toEqual(
        expect.arrayOf({
          id: expect.stringContaining('reply-'),
          username: expect.any(String),
          content: 'Sebuah balasan',
          date: expect.any(String)
        })
      );

      expect(comment2).toEqual(expect.any(Object));
      expect(comment2.id).toEqual('comment-456');
      expect(comment2.username).toEqual(userB.username);
      expect(comment2.content).toEqual('Sebuah komentar');
      expect(Date.parse(comment2.date)).not.toBeNaN();
      expect(comment2.replies).toEqual(expect.any(Array));
      expect(comment2.replies).toHaveLength(0);
    });

    it('should response 200 and return deleted comment and reply correctly', async () => {
      const comment2endpoint = `/threads/${threadId}/comments/${commentId2}`;
      const comment2options = {
        headers: { ...authorizationUserB }
      };
      await serverTest.delete(comment2endpoint, comment2options);

      const reply2endpoint = `/threads/${threadId}/comments/${commentId2}/replies/${replyId2}`;
      const reply2options = {
        headers: { ...authorizationUserA }
      };
      await serverTest.delete(reply2endpoint, reply2options);

      const response = await serverTest.get(`/threads/${threadId}`);
      expect(response.statusCode).toBe(200);

      const responseJson = JSON.parse(response.payload);
      const [comment1, comment2] = responseJson.data.thread.comments;
      expect(comment2.content).toEqual('**komentar telah dihapus**');

      const [reply1, reply2] = comment1.replies;
      expect(reply1.content).toEqual('Sebuah balasan');
      expect(reply2.content).toEqual('**balasan telah dihapus**');
    });
  });
});