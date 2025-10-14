const pool = require('../../database/postgres/pool');
const { createServer } = require('../server');
const { registerUser, loginUser } = require('../../../../tests/ServerHelper');
const container = require('../../containers/container');
const {
  usersTable,
  authenticationsTable,
  threadsTable,
} = require('../../../../tests/db_helper/postgres');

let server;
let currentUserId;
let accessToken;
let currentThreadId;

beforeAll(async () => {
  console.log('BEFORE ALL');
  server = await createServer(container);
  currentUserId = await registerUser(server);
  accessToken = await loginUser(server);
});

afterAll(async () => {
  console.log('AFTER ALL');
  await authenticationsTable.clean();
  await usersTable.clean();
  await pool.end();
});

describe('Threads Endpoints', () => {
  beforeEach(async () => {
    console.log('INIT SERVER');
    await server.initialize();
  });

  afterEach(async () => {
    console.log('STOP SERVER');
    await server.stop();
  });

  describe('POST /threads', () => {
    it('should response 401 when request with no authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson).toEqual(
        expect.objectContaining({
          error: expect.stringContaining('Unauthorized'),
          message: expect.stringContaining('Missing authentication'),
        })
      );
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        title: 'Judul thread',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson).toEqual({
        status: 'fail',
        message: expect.any(String)
      });
    });

    it('should response 400 when request payload does not meet data type specification', async () => {
      const payload = {
        title: 123,
        body: 'Isi thread',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson).toEqual(
        expect.objectContaining({
          status: 'fail',
          message: expect.any(String),
        })
      );
    });

    it('should response 201 and return the persisted thread', async () => {
      const payload = {
        title: 'Judul thread',
        body: 'Isi thread',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson).toEqual(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            addedThread: expect.objectContaining({
              id: expect.stringContaining('thread-'),
              title: 'Judul thread',
              owner: `${currentUserId}`,
            })
          })
        })
      );
    });
  });

  describe('GET /threads/{threadId}', () => {
    beforeEach(async () => {
      console.log('ADD THREAD');
      currentThreadId = await threadsTable.add({ owner: currentUserId });
    });

    afterEach(async () => {
      console.log('CLEAN THREAD');
      await threadsTable.clean();
    });

    describe('thread with empty comments', () => {
      it('should response 200 and correct thread property', async () => {
        const thread = await threadsTable.findById(currentThreadId);
        console.log(thread);
        const response = await server.inject({
          method: 'GET',
          url: `/threads/${currentThreadId}`,
        });

        const responseJson = JSON.parse(response.payload);

        expect(response.statusCode).toBe(200);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.thread.id).toEqual(expect.any(String));
        expect(responseJson.data.thread.id).not.toBe('');
        expect(responseJson.data.thread.title).toBe('Judul thread');
        expect(responseJson.data.thread.body).toBe('Isi thread');
        expect(Date.parse(responseJson.data.thread.date)).not.toBeNaN();
        expect(responseJson.data.thread.username).toBe('forumapi');
        expect(responseJson.data.thread.comments).toEqual(expect.any(Array));
        expect(responseJson.data.thread.comments).toHaveLength(0);
      });
    });
  });
});