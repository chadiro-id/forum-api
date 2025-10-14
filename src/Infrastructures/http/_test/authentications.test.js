const pool = require('../../database/postgres/pool');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');
const container = require('../../containers/container');
const serverTest = require('../../../../tests/server');
const { usersTable, authenticationsTable } = require('../../../../tests/db_helper/postgres');

beforeAll(async () => {
  await serverTest.init();
});

afterAll(async () => {
  await pool.end();
});

describe('Authentications Endpoints', () => {
  const dummyLogin = {
    username: 'johndoe',
    password: 'supersecret^_^007'
  };

  beforeEach(async () => {
    await serverTest.init();
  });

  afterEach(async () => {
    await authenticationsTable.clean();
    await usersTable.clean();
    await serverTest.stop();
  });

  describe('POST /authentications', () => {
    it('should response 201 and new authentication', async () => {
      // const requestPayload = {
      //   username: 'forumapi',
      //   password: 'secret',
      // };
      // const server = await createServer(container);
      // add user
      // await server.inject({
      //   method: 'POST',
      //   url: '/users',
      //   payload: {
      //     username: 'forumapi',
      //     password: 'secret',
      //     fullname: 'Forum Api',
      //   },
      // });
      await serverTest.post('/users', {
        payload: { ...dummyLogin, fullname: 'John Doe' }
      });

      // Action
      // const response = await server.inject({
      //   method: 'POST',
      //   url: '/authentications',
      //   payload: requestPayload,
      // });
      const response = await serverTest.post('/authentications', {
        payload: { ...dummyLogin }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.accessToken).toBeDefined();
      expect(responseJson.data.refreshToken).toBeDefined();
    });

    it('should response 400 if username not found', async () => {
      // Arrange
      // const requestPayload = {
      //   username: 'dicoding',
      //   password: 'secret',
      // };
      // const server = await createServer(container);

      // Action
      // const response = await server.inject({
      //   method: 'POST',
      //   url: '/authentications',
      //   payload: requestPayload,
      // });
      const response = await serverTest.post('/authentications', {
        payload: { ...dummyLogin }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('username tidak ditemukan');
    });

    it('should response 401 if password wrong', async () => {
      // Arrange
      const requestPayload = {
        ...dummyLogin,
        password: 'wrong_password',
      };
      // const server = await createServer(container);
      // Add user
      // await server.inject({
      //   method: 'POST',
      //   url: '/users',
      //   payload: {
      //     username: 'dicoding',
      //     password: 'secret',
      //     fullname: 'Dicoding Indonesia',
      //   },
      // });
      await serverTest.post('/users', {
        payload: {
          ...dummyLogin,
          fullname: 'John Doe',
        }
      });

      // Action
      // const response = await server.inject({
      //   method: 'POST',
      //   url: '/authentications',
      //   payload: requestPayload,
      // });
      const response = await serverTest.post('/authentications', {
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('kredensial yang Anda masukkan salah');
    });

    it('should response 400 if login payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        username: 'johndoe',
      };

      // const server = await createServer(container);

      // Action
      // const response = await server.inject({
      //   method: 'POST',
      //   url: '/authentications',
      //   payload: requestPayload,
      // });
      const response = await serverTest.post('/authentications', {
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirimkan username dan password');
    });

    it('should response 400 if login payload wrong data type', async () => {
      // Arrange
      const requestPayload = {
        username: 123,
        password: 'secret',
      };
      // const server = await createServer(container);

      // Action
      // const response = await server.inject({
      //   method: 'POST',
      //   url: '/authentications',
      //   payload: requestPayload,
      // });
      const response = await serverTest.post('/authentications', {
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('username dan password harus string');
    });
  });

  describe('PUT /authentications', () => {
    it('should return 200 and new access token', async () => {
      // Arrange
      // const server = await createServer(container);

      // await server.inject({
      //   method: 'POST',
      //   url: '/users',
      //   payload: {
      //     username: 'forumapi',
      //     password: 'secret',
      //     fullname: 'Forum Api',
      //   },
      // });
      await serverTest.post('/users', {
        payload: {
          ...dummyLogin,
          fullname: 'John Doe',
        }
      });

      // const loginResponse = await server.inject({
      //   method: 'POST',
      //   url: '/authentications',
      //   payload: {
      //     username: 'forumapi',
      //     password: 'secret',
      //   },
      // });
      const loginResponse = await serverTest.post('/authentications', {
        payload: { ...dummyLogin },
      });
      const { data: { refreshToken } } = JSON.parse(loginResponse.payload);

      // Action
      // const response = await server.inject({
      //   method: 'PUT',
      //   url: '/authentications',
      //   payload: {
      //     refreshToken,
      //   },
      // });
      const response = await serverTest.put('/authentications', {
        payload: { refreshToken },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.accessToken).toBeDefined();
    });

    it('should return 400 payload not contain refresh token', async () => {
      // Arrange
      // const server = await createServer(container);

      // Action
      // const response = await server.inject({
      //   method: 'PUT',
      //   url: '/authentications',
      //   payload: {},
      // });
      const response = await serverTest.put('/authentications', {
        payload: { refreshTokens: '' },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirimkan token refresh');
    });

    it('should return 400 if refresh token not string', async () => {
      // Arrange
      // const server = await createServer(container);

      // Action
      // const response = await server.inject({
      //   method: 'PUT',
      //   url: '/authentications',
      //   payload: {
      //     refreshToken: 123,
      //   },
      // });
      const response = await serverTest.put('/authentications', {
        payload: { refreshToken: 123 },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('refresh token harus string');
    });

    it('should return 400 if refresh token not valid', async () => {
      // Arrange
      // const server = await createServer(container);

      // Action
      // const response = await server.inject({
      //   method: 'PUT',
      //   url: '/authentications',
      //   payload: {
      //     refreshToken: 'invalid_refresh_token',
      //   },
      // });
      const response = await serverTest.put('/authentications', {
        payload: {
          refreshToken: 'invalid_refresh_token',
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('refresh token tidak valid');
    });

    it('should return 400 if refresh token not registered in database', async () => {
      // Arrange
      // const server = await createServer(container);
      const refreshToken = await container.getInstance(AuthenticationTokenManager.name)
        .createRefreshToken({ username: 'johndoe' });

      // Action
      // const response = await server.inject({
      //   method: 'PUT',
      //   url: '/authentications',
      //   payload: {
      //     refreshToken,
      //   },
      // });
      const response = await serverTest.put('/authentications', {
        payload: { refreshToken }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('refresh token tidak ditemukan di database');
    });
  });

  describe('when DELETE /authentications', () => {
    it('should response 200 if refresh token valid', async () => {
      // Arrange
      // const server = await createServer(container);
      const refreshToken = 'refresh_token';
      await authenticationsTable.addToken(refreshToken);

      // Action
      // const response = await server.inject({
      //   method: 'DELETE',
      //   url: '/authentications',
      //   payload: {
      //     refreshToken,
      //   },
      // });
      const response = await serverTest.delete('/authentications', {
        payload: { refreshToken },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 400 if refresh token not registered in database', async () => {
      // Arrange
      // const server = await createServer(container);
      const refreshToken = 'refresh_token';

      // Action
      // const response = await server.inject({
      //   method: 'DELETE',
      //   url: '/authentications',
      //   payload: {
      //     refreshToken,
      //   },
      // });
      const response = await serverTest.delete('/authentications', {
        payload: { refreshToken },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('refresh token tidak ditemukan di database');
    });

    it('should response 400 if payload not contain refresh token', async () => {
      // Arrange
      // const server = await createServer(container);

      // Action
      // const response = await server.inject({
      //   method: 'DELETE',
      //   url: '/authentications',
      //   payload: {},
      // });
      const response = await serverTest.delete('/authentications', {
        payload: {},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirimkan token refresh');
    });

    it('should response 400 if refresh token not string', async () => {
      // Arrange
      // const server = await createServer(container);

      // Action
      // const response = await server.inject({
      //   method: 'DELETE',
      //   url: '/authentications',
      //   payload: {
      //     refreshToken: 123,
      //   },
      // });
      const response = await serverTest.delete('/authentications', {
        payload: {
          refreshToken: 123,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('refresh token harus string');
    });
  });
});