const pool = require('../../database/postgres/pool');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');
const container = require('../../containers/container');
const serverTest = require('../../../../tests/helper/ServerTestHelper');
const { usersTable, authenticationsTable } = require('../../../../tests/helper/postgres');

beforeAll(async () => {
  await serverTest.setup();
});

afterAll(async () => {
  await pool.end();
});

describe('[Integration] Authentications Endpoints', () => {
  const loginUser = {
    username: 'johndoe',
    password: 'supersecret^_^007'
  };
  const registerUser = {
    ...loginUser,
    fullname: 'John Doe',
  };

  beforeEach(async () => {
    await serverTest.init();
  });

  afterEach(async () => {
    await serverTest.stop();
  });

  describe('POST /authentications', () => {
    beforeAll(async () => {
      await serverTest.post('/users', {
        payload: { ...registerUser }
      });
    });

    afterAll(async () => {
      await authenticationsTable.clean();
      await usersTable.clean();
    });

    it('should response 201 and user authentication', async () => {
      const response = await serverTest.post('/authentications', {
        payload: { ...loginUser }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.accessToken).toBeDefined();
      expect(responseJson.data.refreshToken).toBeDefined();
    });

    it('should response 400 when username is unknown', async () => {
      const response = await serverTest.post('/authentications', {
        payload: { ...loginUser, username: 'johnnnndoe' }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        expect.stringContaining('username tidak ditemukan')
      );
    });

    it('should response 401 when password is incorrect', async () => {
      const requestPayload = {
        ...loginUser,
        password: 'wrong_password',
      };

      const response = await serverTest.post('/authentications', {
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('kredensial yang Anda masukkan salah');
    });

    it('should response 400 when login payload has wrong data type', async () => {
      const requestPayload = {
        username: 123,
        password: 'secret',
      };

      const response = await serverTest.post('/authentications', {
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.stringContaining('harus berupa teks'));
    });

    it('should response 400 when login payload not contain needed property', async () => {
      const requestPayload = {
        username: 'johndoe',
      };
      const response = await serverTest.post('/authentications', {
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.stringContaining('wajib diisi'));
    });
  });

  describe('PUT /authentications', () => {
    beforeAll(async () => {
      await serverTest.post('/users', {
        payload: { ...registerUser }
      });
    });

    afterAll(async () => {
      await authenticationsTable.clean();
      await usersTable.clean();
    });

    it('should response 200 and new access token', async () => {
      const loginResponse = await serverTest.post('/authentications', {
        payload: { ...loginUser },
      });
      const { data: { refreshToken } } = JSON.parse(loginResponse.payload);

      const response = await serverTest.put('/authentications', {
        payload: { refreshToken },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.accessToken).toBeDefined();
    });

    it('should response 400 when payload not contain refresh token', async () => {
      const response = await serverTest.put('/authentications', {
        payload: { refreshTokens: '' },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.stringContaining('wajib diisi'));
    });

    it('should response 400 when refresh token not string', async () => {
      const response = await serverTest.put('/authentications', {
        payload: { refreshToken: 123 },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.stringContaining('harus berupa teks'));
    });

    it('should response 400 when refresh token not valid', async () => {
      const response = await serverTest.put('/authentications', {
        payload: {
          refreshToken: 'invalid_refresh_token',
        }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('refresh token tidak valid');
    });

    it('should response 400 when refresh token not registered in database', async () => {
      const refreshToken = await container.getInstance(AuthenticationTokenManager.name)
        .createRefreshToken({ username: 'johndoe' });

      const response = await serverTest.put('/authentications', {
        payload: { refreshToken }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('refresh token tidak ditemukan di database');
    });
  });

  describe('DELETE /authentications', () => {
    beforeAll(async () => {
      await authenticationsTable.addToken('registered_refresh_token');
    });

    afterAll(async () => {
      await authenticationsTable.clean();
    });

    it('should response 200 when refresh token is valid', async () => {
      const refreshToken = 'registered_refresh_token';

      const response = await serverTest.delete('/authentications', {
        payload: { refreshToken },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 400 when payload not contain refresh token', async () => {
      const response = await serverTest.delete('/authentications', {
        payload: {},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.stringContaining('wajib diisi'));
    });

    it('should response 400 when refresh token not string', async () => {
      const response = await serverTest.delete('/authentications', {
        payload: {
          refreshToken: 123,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.stringContaining('harus berupa teks'));
    });

    it('should response 400 when refresh token not registered in database', async () => {
      const refreshToken = 'refresh_token';

      const response = await serverTest.delete('/authentications', {
        payload: { refreshToken },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('refresh token tidak ditemukan di database');
    });
  });
});