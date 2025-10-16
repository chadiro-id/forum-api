const pool = require('../../database/postgres/pool');
const serverTest = require('../../../../tests/server');
const { getUserAuth } = require('../../../../tests/server/helper');
const {
  usersTable,
  authenticationsTable,
  threadsTable,
  commentsTable,
} = require('../../../../tests/helper/postgres');

let userA;
let userAuthA;
let userB;
let userAuthB;

beforeAll(async () => {
  await serverTest.init();

  userA = await usersTable.add({ id: 'user-123', username: 'whoami' });
  userB = await usersTable.add({ id: 'user-456', username: 'johndoe' });

  userAuthA = await getUserAuth({ ...userA });
  userAuthB = await getUserAuth({ ...userB });
});

afterAll(async () => {
  await usersTable.clean();
  await authenticationsTable.clean();
  await pool.end();
});

describe('Comments Endpoints', () => {
  let authorizationUserA;
  let authorizationUserB;

  beforeAll(async () => {
    authorizationUserA = {
      Authorization: `Bearer ${userAuthA.accessToken}`,
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

  describe('POST /threads/{threadId}/comments', () => {
    let threadId;
    let endpoint;

    beforeAll(async () => {
      threadId = await threadsTable.add({ owner: userA.id });
      endpoint = `/threads/${threadId}/comments`;
    });

    afterAll(async () => {
      await threadsTable.clean();
    });

    it('should response 401 when request with no authentications', async () => {
      const options = {
        payload: { content: 'Sebuah komentar' }
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when request for a thread that does not exists', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: { content: 'Sebuah komentar' },
      };

      const response = await serverTest.post('/threads/xxx/comments', options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message).not.toBe('');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: { contents: 'Incorrect content property' },
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message).not.toBe('');
    });

    it('should response 400 when request payload has wrong data type', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: { content: ['Sebuah komentar'] },
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message).not.toBe('');
    });

    it('should response 201 and the persisted comment', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: { content: 'Sebuah komentar' },
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data).toEqual(expect.any(Object));
      expect(responseJson.data.addedComment).toEqual(expect.any(Object));
      expect(responseJson.data.addedComment.id).toEqual(expect.stringContaining('comment-'));
      expect(responseJson.data.addedComment.content).toEqual('Sebuah komentar');
      expect(responseJson.data.addedComment.owner).toEqual(userA.id);
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    let threadId;
    let commentUserA, commentUserB;

    beforeAll(async () => {
      threadId = await threadsTable.add({ owner: userA.id });
      commentUserA = await commentsTable.add({ id: 'comment-123', threadId, owner: userA.id });
      commentUserB = await commentsTable.add({ id: 'comment-456', threadId, owner: userB.id });
    });

    afterAll(async () => {
      await threadsTable.clean();
      await commentsTable.clean();
    });

    it('should response 401 when delete comment without authentication', async () => {
      const endpoint = `/threads/${threadId}/comments/${commentUserA}`;

      const response = await serverTest.delete(endpoint);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when delete comment that not exists', async () => {
      const endpoint = `/threads/${threadId}/comments/xxx`;
      const options = {
        headers: { ...authorizationUserB }
      };

      const response = await serverTest.delete(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message.trim()).not.toBe('');
    });

    it('should response 403 when delete comment by not authorized user', async () => {
      const endpoint = `/threads/${threadId}/comments/${commentUserB}`;
      const options = {
        headers: { ...authorizationUserA }
      };

      const response = await serverTest.delete(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message.trim()).not.toBe('');
    });

    it('should response 200 when delete comment by authorized user', async () => {
      const endpoint = `/threads/${threadId}/comments/${commentUserA}`;
      const options = {
        headers: { ...authorizationUserA }
      };

      const response = await serverTest.delete(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});