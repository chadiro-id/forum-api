const serverTest = require('../../../../tests/helper/ServerTestHelper');
const pgTest = require('../../../../tests/helper/postgres');
const { createAuthToken, createHashedPassword } = require('../../../../tests/helper/authenticationHelper');

beforeAll(async () => {
  await serverTest.init();
  await pgTest.truncate();
});

afterAll(async () => {
  await pgTest.end();
  await serverTest.stop();
});

describe('[Integration] Authentications Endpoints', () => {
  const loginUser = {
    username: 'johndoe',
    password: 'supersecret^_^007',
  };

  afterEach(async () => {
    await pgTest.authentications.clean();
    await pgTest.users.clean();
  });

  describe('POST /authentications', () => {
    it('should response 201 and user authentication', async () => {
      const hashedPassword = await createHashedPassword(loginUser.password);
      await pgTest.users.add({
        username: loginUser.username,
        password: hashedPassword,
        fullname: 'John Doe'
      });

      const options = { payload: { ...loginUser } };
      const response = await serverTest.post('/authentications', options);
      expect(response.statusCode).toBe(201);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'success',
        data: {
          accessToken: expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/),
          refreshToken: expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/),
        }
      });

      const { data: { accessToken, refreshToken } } = resJson;
      expect(accessToken).not.toBe(refreshToken);
    });

    it('should response 400 when username is not found', async () => {
      const options = {
        payload: { ...loginUser, username: 'unknown-username' }
      };

      const response = await serverTest.post('/authentications', options);
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: 'pengguna tidak ditemukan',
      });
    });

    it('should response 401 when password is incorrect', async () => {
      const hashedPassword = await createHashedPassword(loginUser.password);
      await pgTest.users.add({
        username: loginUser.username,
        password: hashedPassword,
        fullname: 'John Doe'
      });

      const options = {
        payload: { ...loginUser, password: 'incorrect_password' },
      };

      const response = await serverTest.post('/authentications', options);
      expect(response.statusCode).toBe(401);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: 'kredensial yang Anda masukkan salah',
      });
    });

    it('should response 400 when payload has wrong data type', async () => {
      const options = {
        payload: { ...loginUser, password: 123 },
      };

      const response = await serverTest.post('/authentications', options);
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: '"password" harus berupa teks',
      });
    });

    it('should response 400 when payload not contain needed property', async () => {
      const options = {
        payload: { username: loginUser.username },
      };

      const response = await serverTest.post('/authentications', options);
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: '"password" wajib diisi',
      });
    });
  });

  describe('PUT /authentications', () => {
    it('should response 200 and new access token', async () => {
      const hashedPassword = await createHashedPassword(loginUser.password);
      const user = await pgTest.users.add({
        username: loginUser.username,
        password: hashedPassword,
        fullname: 'John Doe'
      });
      const { accessToken, refreshToken } = await createAuthToken({ ...user });
      await pgTest.authentications.addToken(refreshToken);

      const options = { payload: { refreshToken } };
      const response = await serverTest.put('/authentications', options);
      expect(response.statusCode).toBe(200);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'success',
        data: {
          accessToken: expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/),
        },
      });

      const { data: { accessToken: newAccessToken } } = resJson;
      expect(newAccessToken).not.toBe(accessToken);
      expect(newAccessToken).not.toBe(refreshToken);
    });

    it('should response 400 when payload not contain refresh token', async () => {
      const options = {
        payload: { refreshTokens: 'typo_refresh_token_property' },
      };

      const response = await serverTest.put('/authentications', options);
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: '"refresh token" wajib diisi',
      });
    });

    it('should response 400 when refresh token not string', async () => {
      const options = {
        payload: { refreshToken: 123 },
      };
      const response = await serverTest.put('/authentications', options);
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: '"refresh token" harus berupa teks',
      });
    });

    it('should response 400 when refresh token not valid', async () => {
      const options = {
        payload: { refreshToken: 'invalid_refresh_token' },
      };
      const response = await serverTest.put('/authentications', options);
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: 'refresh token tidak valid',
      });
    });

    it('should response 400 when refresh token not registered in database', async () => {
      const { refreshToken: otherRefreshToken } = await createAuthToken({ username: 'otherusername' });

      const response = await serverTest.put('/authentications', {
        payload: { refreshToken: otherRefreshToken }
      });
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: 'refresh token tidak ditemukan di database',
      });
    });
  });

  describe('DELETE /authentications', () => {
    it('should response 200 and status "success"', async () => {
      const hashedPassword = await createHashedPassword(loginUser.password);
      const user = await pgTest.users.add({
        username: loginUser.username,
        password: hashedPassword,
        fullname: 'John Doe'
      });
      const { refreshToken } = await createAuthToken({ ...user });
      await pgTest.authentications.addToken(refreshToken);

      const options = { payload: { refreshToken } };
      const response = await serverTest.delete('/authentications', options);
      expect(response.statusCode).toBe(200);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'success',
      });
    });

    it('should response 400 when payload not contain refresh token', async () => {
      const options = { payload: {} };
      const response = await serverTest.delete('/authentications', options);
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: '"refresh token" wajib diisi',
      });
    });

    it('should response 400 when refresh token not string', async () => {
      const options = {
        payload: { refreshToken: 123 },
      };

      const response = await serverTest.delete('/authentications', options);
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: '"refresh token" harus berupa teks',
      });
    });

    it('should response 400 when refresh token not registered in database', async () => {
      const refreshToken = 'unregistered_refresh_token';

      const response = await serverTest.delete('/authentications', {
        payload: { refreshToken },
      });
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: 'refresh token tidak ditemukan di database',
      });
    });
  });
});