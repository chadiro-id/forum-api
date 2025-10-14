const pool = require('../../database/postgres/pool');
const serverTest = require('../../../../tests/server');
const { getUserAuth } = require('../../../../tests/server/helper');
const {
  usersTable,
  authenticationsTable,
  threadsTable,
  // commentsTable,
} = require('../../../../tests/db_helper/postgres');

let userA;
let userAuthA;
// let userB;
// let accessTokenB;

beforeAll(async () => {
  await serverTest.init();

  userA = await usersTable.add({ id: 'user-123', username: 'whoami' });
  // userB = await usersTable.add({ id: 'user-456', username: 'johndoe' });

  userAuthA = await getUserAuth({ ...userA });
  // accessTokenB = await getUserAuth({ id: 'user-456', username: 'johndoe' });
});

afterAll(async () => {
  await usersTable.clean();
  await authenticationsTable.clean();
  await pool.end();
});

describe('Comments Endpoints', () => {
  beforeEach(async () => {
    await serverTest.init();
  });

  afterEach(async () => {
    await serverTest.stop();
  });

  describe('POST /threads/{threadId}/comments', () => {
    let currentThreadId;
    let authorizationUserA;

    beforeAll(async () => {
      currentThreadId = await threadsTable.add({ owner: userA.id });
      authorizationUserA = {
        Authorization: `Bearer ${userAuthA.accessToken}`,
      };
    });

    afterAll(async () => {
      await threadsTable.clean();
    });

    it('should response 401 when request with no authentications', async () => {
      const response = await serverTest.post(`/threads/${currentThreadId}/comments`);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when request for a thread that does not exists', async () => {
      const response = await serverTest.post('/threads/xxx/comments', {
        headers: { ...authorizationUserA },
        payload: { content: 'Sebuah komentar' },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message).not.toBe('');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const response = await serverTest.post(`/threads/${currentThreadId}/comments`, {
        headers: { ...authorizationUserA },
        payload: { contents: 'Sebuah komentar' },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message).not.toBe('');
    });
  });
});