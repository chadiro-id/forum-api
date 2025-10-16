const pool = require('../../database/postgres/pool');
const serverTest = require('../../../../tests/server');
const { getUserAuth } = require('../../../../tests/server/helper');
const {
  usersTable,
  authenticationsTable,
  threadsTable,
} = require('../../../../tests/db_helper/postgres');

let currentUser;
let currentUserAuth;

beforeAll(async () => {
  await serverTest.init();
  currentUser = await usersTable.add({ username: 'whoami' });
  currentUserAuth = await getUserAuth({ username: 'whoami' });
});

afterAll(async () => {
  await authenticationsTable.clean();
  await usersTable.clean();
  await pool.end();
});

describe('Threads Endpoints', () => {
  beforeEach(async () => {
    await serverTest.init();
  });

  afterEach(async () => {
    await serverTest.stop();
  });

  describe('POST /threads', () => {
    let authorization;
    const dummyPayload = {
      title: 'Judul thread',
      body: 'Sebuah thread',
    };

    beforeAll(async () => {
      authorization = {
        Authorization: `Bearer ${currentUserAuth.accessToken}`
      };
    });

    it('should response 401 when request with no authentication', async () => {
      const response = await serverTest.post('/threads', {
        payload: { ...dummyPayload }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const response = await serverTest.post('/threads', {
        headers: { ...authorization },
        payload: {}
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message).not.toBe('');
    });

    it('should response 400 when request payload does not meet data type specification', async () => {
      const response = await serverTest.post('/threads', {
        headers: { ...authorization },
        payload: { ...dummyPayload, body: 123 },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message).not.toBe('');
    });

    it('should response 201 and return the persisted thread', async () => {
      const response = await serverTest.post('/threads', {
        headers: { ...authorization },
        payload: { ...dummyPayload },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data).toHaveProperty('addedThread');
      expect(responseJson.data.addedThread).toEqual({
        id: expect.stringContaining('thread-'),
        title: dummyPayload.title,
        owner: currentUser.id,
      });
    });
  });

  describe('GET /threads/{threadId}', () => {
    let threadId;

    beforeEach(async () => {
      threadId = await threadsTable.add({ owner: currentUser.id });
    });

    afterEach(async () => {
      await threadsTable.clean();
    });

    it('should response 200 and detail thread', async () => {
      const response = await serverTest.get(`/threads/${threadId}`);

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.id).toEqual(expect.stringContaining('thread-'));
      expect(responseJson.data.thread.id).not.toBe('');
      expect(responseJson.data.thread.title).toBe('Judul thread');
      expect(responseJson.data.thread.body).toBe('Isi thread');
      expect(Date.parse(responseJson.data.thread.date)).not.toBeNaN();
      expect(responseJson.data.thread.username).toBe(currentUser.username);
      expect(responseJson.data.thread.comments).toEqual(expect.any(Array));
      expect(responseJson.data.thread.comments).toHaveLength(0);
    });
  });
});