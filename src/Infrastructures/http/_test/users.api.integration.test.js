const pool = require('../../database/postgres/pool');
const serverTest = require('../../../../tests/helper/ServerTestHelper');
const { usersTable } = require('../../../../tests/helper/postgres');
const { assertHttpResponseError } = require('../../../../tests/helper/assertionsHelper');

beforeAll(async () => {
  await serverTest.init();
  await usersTable.add({ id: 'user-1000', username: 'superuser' });
});

afterAll(async () => {
  await usersTable.clean();
  await pool.end();
  await serverTest.stop();
});

describe('[Integration] Users Endpoints', () => {
  describe('POST /users', () => {
    const dummyPayload = {
      username: 'johndoe',
      password: 'supersecret^_^@01',
      fullname: 'John Doe',
    };

    it('should response 201 and persisted user', async () => {
      const response = await serverTest.post('/users', {
        payload: { ...dummyPayload }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedUser).toEqual({
        id: expect.stringContaining('user-'),
        username: dummyPayload.username,
        fullname: dummyPayload.fullname,
      });
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = { ...dummyPayload };
      delete requestPayload.fullname;

      const response = await serverTest.post('/users', {
        payload: requestPayload,
      });

      assertHttpResponseError(response, 400);
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        ...dummyPayload,
        fullname: ['John Doe'],
      };

      const response = await serverTest.post('/users', {
        payload: requestPayload,
      });

      assertHttpResponseError(response, 400);
    });

    it('should response 400 when username more than 50 character', async () => {
      const requestPayload = {
        ...dummyPayload,
        username: 'johndoe'.repeat(10),
      };

      const response = await serverTest.post('/users', {
        payload: requestPayload,
      });

      assertHttpResponseError(response, 400, { message: 'username maksimal 50 karakter' });
    });

    it('should response 400 when username contain restricted character', async () => {
      const requestPayload = {
        ...dummyPayload,
        username: 'john doe',
      };

      const response = await serverTest.post('/users', {
        payload: requestPayload,
      });

      assertHttpResponseError(
        response, 400, { message: 'tidak dapat membuat user baru karena username mengandung karakter terlarang' }
      );
    });

    it('should response 400 when username unavailable', async () => {
      const requestPayload = {
        ...dummyPayload,
        username: 'superuser',
      };

      const response = await serverTest.post('/users', {
        payload: requestPayload,
      });

      assertHttpResponseError(response, 400, { message: 'username tidak tersedia' });
    });
  });
});
