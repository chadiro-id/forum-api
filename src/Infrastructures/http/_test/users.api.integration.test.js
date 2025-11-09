const serverTest = require('../../../../tests/helper/ServerTestHelper');
const pgTest = require('../../../../tests/helper/postgres');

beforeAll(async () => {
  await serverTest.init();
  await pgTest.truncate();
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

  afterEach(async () => {
    await pgTest.users.clean();
  });

  describe('POST /users', () => {
    it('should response 201 and persisted user', async () => {
      const expectedResJson = {
        status: 'success',
        data: {
          addedUser: {
            id: expect.stringMatching(/^user-[A-Za-z0-9_-]{21}$/),
            username: dummyPayload.username,
            fullname: dummyPayload.fullname,
          }
        }
      };

      const options = { payload: { ...dummyPayload } };

      const response = await serverTest.post('/users', options);
      expect(response.statusCode).toEqual(201);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual(expectedResJson);
    });

    it('should response 400 when payload not contain needed property', async () => {
      const payload = { ...dummyPayload };
      delete payload.fullname;

      const response = await serverTest.post('/users', { payload });
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: '"fullname" wajib diisi',
      });
    });

    it('should response 400 when payload not meet data type specification', async () => {
      const payload = { ...dummyPayload, fullname: ['John Doe'] };

      const response = await serverTest.post('/users', { payload });
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: '"fullname" harus berupa teks',
      });
    });

    it('should response 400 when username more than 50 character', async () => {
      const payload = { ...dummyPayload, username: 'a'.repeat(51) };

      const response = await serverTest.post('/users', { payload });
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: 'username maksimal 50 karakter',
      });
    });

    it('should response 400 when username contain restricted character', async () => {
      const payload = { ...dummyPayload, username: 'john doe' };

      const response = await serverTest.post('/users', { payload });
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: 'tidak dapat membuat user baru karena username mengandung karakter terlarang',
      });
    });

    it('should response 400 when username not available', async () => {
      await pgTest.users.add({ id: 'user-101', username: 'johndoe' });

      const payload = { ...dummyPayload, username: 'johndoe' };
      const response = await serverTest.post('/users', { payload });
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: 'username tidak tersedia',
      });
    });
  });
});