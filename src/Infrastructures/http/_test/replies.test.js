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
let accessTokenA;

beforeAll(async () => {
  await serverTest.init();

  userA = await usersTable.add({ id: 'user-123', username: 'whoami' });
  accessTokenA = await getUserAuth({ username: 'whoami', id: 'user-123' });
});

afterAll(async () => {
  await usersTable.clean();
  await authenticationsTable.clean();
  await pool.end();
});

describe('Replies Endpoints', () => {
  let threadId, commentId;

  beforeAll(async () => {
    threadId = await threadsTable.add({ owner: userA });
    commentId = await commentsTable.add({ owner: userA });
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
      const response = await serverTest.post(
        `/threads/${threadId}/comments/${commentId}/replies`,
        { payload: { content: 'Sebuah balasan' } }
      );

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when request for not existing thread', async () => {
      const endpoint = `/threads/xxx/comments/${commentId}/replies`;
      const options = {
        headers: { Authorization: `Bearer ${accessTokenA}` },
        payload: { content: 'Sebuah balasan' },
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message).not.toBe('');
    });
  });
});