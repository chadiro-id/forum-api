const pool = require('../../database/postgres/pool');
const serverTest = require('../../../../tests/helper/ServerTestHelper');
const pgTest = require('../../../../tests/helper/postgres');
const { assertHttpResponseError } = require('../../../../tests/helper/assertionsHelper');

beforeAll(async () => {
  pgTest.init(pool);
  await serverTest.init();
});

afterAll(async () => {
  await pgTest.end();
  await serverTest.stop();
});

describe('[Integration] Users Endpoints', () => {
  const dummyPayload = {
    username: 'dicoder',
    password: 'supersecret^_^@01',
    fullname: 'Dicoding User',
  };

  beforeEach(async () => {
    await pgTest.truncate();
  });

  describe('POST /users', () => {
    it('should response 201 and persisted user', async () => {
      const options = { payload: { ...dummyPayload } };

      const response = await serverTest.post('/users', options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedUser).toEqual(
        expect.objectContaining({
          id: expect.stringContaining('user-'),
          username: dummyPayload.username,
          fullname: dummyPayload.fullname,
        })
      );
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const payload = { ...dummyPayload };
      delete payload.fullname;

      const response = await serverTest.post('/users', { payload });

      assertHttpResponseError(response, 400);
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const payload = { ...dummyPayload, fullname: ['John Doe'] };
      const response = await serverTest.post('/users', { payload });

      assertHttpResponseError(response, 400);
    });

    it('should response 400 when username more than 50 character', async () => {
      const payload = { ...dummyPayload, username: 'a'.repeat(51) };
      const response = await serverTest.post('/users', { payload });

      assertHttpResponseError(response, 400, { message: 'username maksimal 50 karakter' });
    });

    it('should response 400 when username contain restricted character', async () => {
      const payload = { ...dummyPayload, username: 'john doe' };
      const response = await serverTest.post('/users', { payload });

      assertHttpResponseError(
        response, 400, { message: 'tidak dapat membuat user baru karena username mengandung karakter terlarang' }
      );
    });

    it('should response 400 when username unavailable', async () => {
      await pgTest.users().add({ id: 'user-101', username: 'johndoe' });

      const payload = { ...dummyPayload, username: 'johndoe' };
      const response = await serverTest.post('/users', { payload });

      assertHttpResponseError(response, 400, { message: 'username tidak tersedia' });
    });
  });
});
