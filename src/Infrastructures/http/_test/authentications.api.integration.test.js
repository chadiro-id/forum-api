const pool = require('../../database/postgres/pool');
const serverTest = require('../../../../tests/helper/ServerTestHelper');
const { createAuthToken, createHashedPassword } = require('../../../../tests/helper/authenticationHelper');
const { usersTable, authenticationsTable } = require('../../../../tests/helper/postgres');
const { assertHttpResponseError } = require('../../../../tests/helper/assertionsHelper');

beforeAll(async () => {
  await serverTest.init();
  await authenticationsTable.clean();
  await usersTable.clean();
});

afterAll(async () => {
  await pool.end();
  await serverTest.stop();
});

describe('[Integration] Authentications Endpoints', () => {
  const loginUser = {
    username: 'johndoe',
    password: 'supersecret^_^007',
  };

  afterEach(async () => {
    await authenticationsTable.clean();
    await usersTable.clean();
  });

  describe('POST /authentications', () => {
    it('should response 201 and user authentication', async () => {
      const hashedPassword = await createHashedPassword(loginUser.password);
      await usersTable.add({
        username: loginUser.username,
        password: hashedPassword,
        fullname: 'John Doe'
      });

      const options = { payload: { ...loginUser } };
      const response = await serverTest.post('/authentications', options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.accessToken).toBeDefined();
      expect(responseJson.data.refreshToken).toBeDefined();
    });

    it('should response 400 when username is unknown', async () => {
      const options = {
        payload: { ...loginUser, username: 'unknown-username' }
      };
      const response = await serverTest.post('/authentications', options);

      assertHttpResponseError(response, 400, { message: 'username tidak ditemukan' });
    });

    it('should response 401 when password is incorrect', async () => {
      const hashedPassword = await createHashedPassword(loginUser.password);
      await usersTable.add({
        username: loginUser.username,
        password: hashedPassword,
        fullname: 'John Doe'
      });

      const options = {
        payload: { ...loginUser, password: 'incorrect_password' },
      };

      const response = await serverTest.post('/authentications', options);

      assertHttpResponseError(response, 401, { message: 'kredensial yang Anda masukkan salah' });
    });

    it('should response 400 when payload has wrong data type', async () => {
      const options = {
        payload: { ...loginUser, password: 123 },
      };

      const response = await serverTest.post('/authentications', options);

      assertHttpResponseError(response, 400, { message: 'harus berupa teks' });
    });

    it('should response 400 when payload not contain needed property', async () => {
      const options = {
        payload: { username: loginUser.username },
      };
      const response = await serverTest.post('/authentications', options);

      assertHttpResponseError(response, 400, { message: 'wajib diisi' });
    });
  });

  describe('PUT /authentications', () => {
    it('should response 200 and new access token', async () => {
      const hashedPassword = await createHashedPassword(loginUser.password);
      const user = await usersTable.add({
        username: loginUser.username,
        password: hashedPassword,
        fullname: 'John Doe'
      });
      const { accessToken, refreshToken } = await createAuthToken({ ...user });
      await authenticationsTable.addToken(refreshToken);

      const options = { payload: { refreshToken } };
      const response = await serverTest.put('/authentications', options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.accessToken).toBeDefined();
      expect(responseJson.data.accessToken).not.toEqual(accessToken);
    });

    it('should response 400 when payload not contain refresh token', async () => {
      const options = {
        payload: { refreshTokens: 'typo_refresh_token_property' },
      };
      const response = await serverTest.put('/authentications', options);

      assertHttpResponseError(response, 400, { message: 'wajib diisi' });
    });

    it('should response 400 when refresh token not string', async () => {
      const options = {
        payload: { refreshToken: 123 },
      };
      const response = await serverTest.put('/authentications', options);

      assertHttpResponseError(response, 400, { message: 'harus berupa teks' });
    });

    it('should response 400 when refresh token not valid', async () => {
      const options = {
        payload: { refreshToken: 'invalid_refresh_token' },
      };
      const response = await serverTest.put('/authentications', options);

      assertHttpResponseError(response, 400, { message: 'refresh token tidak valid' });
    });

    it('should response 400 when refresh token not registered in database', async () => {
      const { refreshToken: otherRefreshToken } = await createAuthToken({ username: 'otherusername' });

      const response = await serverTest.put('/authentications', {
        payload: { refreshToken: otherRefreshToken }
      });

      assertHttpResponseError(response, 400, { message: 'refresh token tidak ditemukan di database' });
    });
  });

  describe('DELETE /authentications', () => {
    it('should response 200 and status "success"', async () => {
      const hashedPassword = await createHashedPassword(loginUser.password);
      const user = await usersTable.add({
        username: loginUser.username,
        password: hashedPassword,
        fullname: 'John Doe'
      });
      const { refreshToken } = await createAuthToken({ ...user });
      await authenticationsTable.addToken(refreshToken);

      const options = { payload: { refreshToken } };
      const response = await serverTest.delete('/authentications', options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 400 when payload not contain refresh token', async () => {
      const options = { payload: {} };
      const response = await serverTest.delete('/authentications', options);

      assertHttpResponseError(response, 400, { message: 'wajib diisi' });
    });

    it('should response 400 when refresh token not string', async () => {
      const options = {
        payload: { refreshToken: 123 },
      };
      const response = await serverTest.delete('/authentications', options);

      assertHttpResponseError(response, 400, { message: 'harus berupa teks' });
    });

    it('should response 400 when refresh token not registered in database', async () => {
      const refreshToken = 'unregistered_refresh_token';

      const response = await serverTest.delete('/authentications', {
        payload: { refreshToken },
      });

      assertHttpResponseError(response, 400, { message: 'refresh token tidak ditemukan di database' });
    });
  });
});