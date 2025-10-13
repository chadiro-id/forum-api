const pool = require('../../database/postgres/pool');
const { createServer } = require('../server');
const { registerUser, loginUser } = require('../../../../tests/ServerHelper');
const container = require('../../containers/container');
const { usersTable, authenticationsTable } = require('../../../../tests/db_helper/postgres');

describe('Threads Endpoints', () => {
  let server;
  let userId;
  let accessToken;

  beforeAll(async () => {
    server = await createServer(container);
    userId = await registerUser(server);
    accessToken = await loginUser(server);
  });

  beforeEach(async () => {
    await server.initialize();
  });

  afterEach(async () => {
    await server.stop();
  });

  afterAll(async () => {
    await authenticationsTable.clean();
    await usersTable.clean();
    await pool.end();
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
              owner: `${userId}`,
            })
          })
        })
      );
    });
  });
});