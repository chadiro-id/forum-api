const pool = require('../../database/postgres/pool');
const serverTest = require('../../../../tests/server');
const { getUserAuth } = require('../../../../tests/server/helper');
const {
  usersTable,
  authenticationsTable,
  threadsTable,
  commentsTable,
} = require('../../../../tests/db_helper/postgres');

let userA;
let userAuthA;

beforeAll(async () => {
  await serverTest.init();

  userA = await usersTable.add({ id: 'user-123', username: 'whoami' });
  userAuthA = await getUserAuth({ ...userA });
});

afterAll(async () => {
  await usersTable.clean();
  await authenticationsTable.clean();
  await pool.end();
});

describe('Replies Endpoints', () => {
  let threadId, commentId;
  let authorizationUserA;

  beforeAll(async () => {
    threadId = await threadsTable.add({ owner: userA.id });
    commentId = await commentsTable.add({ threadId, owner: userA.id });

    authorizationUserA = {
      Authorization: `Bearer ${userAuthA.accessToken}`
    };
  });

  beforeEach(async () => {
    await serverTest.init();
  });

  afterEach(async () => {
    await serverTest.stop();
  });

  afterAll(async () => {
    await threadsTable.clean();
    await commentsTable.clean();
  });

  describe('POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when request with no authentication', async () => {
      const endpoint = `/threads/${threadId}/comments/${commentId}/replies`;
      const response = await serverTest.post(endpoint, {
        payload: { content: 'Sebuah balasan' }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread does not exists', async () => {
      const endpoint = `/threads/xxx/comments/${commentId}/replies`;
      const options = {
        headers: { ...authorizationUserA },
        payload: { content: 'Sebuah balasan' },
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message.trim()).not.toBe('');
    });

    it('should response 404 when comment does not exists', async () => {
      const endpoint = `/threads/${threadId}/comments/xxx/replies`;
      const options = {
        headers: { ...authorizationUserA },
        payload: { content: 'Sebuah balasan' },
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message.trim()).not.toBe('');
    });

    it('should response 400 when payload not contain needed property', async () => {
      const endpoint = `/threads/${threadId}/comments/${commentId}/replies`;
      const options = {
        headers: { ...authorizationUserA },
        payload: { contents: 'Incorrect property name' }
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message.trim()).not.toBe('');
    });

    it('should response 400 when payload has wrong data type', async () => {
      const endpoint = `/threads/${threadId}/comments/${commentId}/replies`;
      const options = {
        headers: { ...authorizationUserA },
        payload: { content: 123 }
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message.trim()).not.toBe('');
    });

    it('should response 201 and the persisted reply', async () => {
      const endpoint = `/threads/${threadId}/comments/${commentId}/replies`;
      const options = {
        headers: { ...authorizationUserA },
        payload: { content: 'Sebuah balasan' }
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data).toEqual(expect.any(Object));
      expect(responseJson.data.addedReply).toEqual(expect.any(Object));
      expect(responseJson.data.addedReply.id).toEqual(expect.stringContaining('reply-'));
      expect(responseJson.data.addedReply.content).toEqual('Sebuah balasan');
      expect(responseJson.data.addedReply.owner).toEqual(userA.id);
    });
  });
});