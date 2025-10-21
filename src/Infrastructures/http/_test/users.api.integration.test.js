const pool = require('../../database/postgres/pool');
const serverTest = require('../../../../tests/helper/ServerTestHelper');
const { usersTable } = require('../../../../tests/helper/postgres');

beforeAll(async () => {
  await serverTest.setup();
  await usersTable.add({ id: 'user-1000', username: 'superuser' });
});

afterAll(async () => {
  await usersTable.clean();
  await pool.end();
});

describe('Users Endpoints', () => {
  beforeEach(async () => {
    await serverTest.init();
  });

  afterEach(async () => {
    await serverTest.stop();
  });

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

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        expect.stringContaining('wajib diisi')
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        ...dummyPayload,
        fullname: ['John Doe'],
      };

      const response = await serverTest.post('/users', {
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        expect.stringContaining('harus berupa teks')
      );
    });

    it('should response 400 when username more than 50 character', async () => {
      const requestPayload = {
        ...dummyPayload,
        username: 'johndoejohndoejohndoejohndoejohndoejohndoejohndoejohndoe',
      };

      const response = await serverTest.post('/users', {
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        expect.stringContaining('username maksimal 50 karakter')
      );
    });

    it('should response 400 when username contain restricted character', async () => {
      const requestPayload = {
        ...dummyPayload,
        username: 'john doe',
      };

      const response = await serverTest.post('/users', {
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        expect.stringContaining('username mengandung karakter terlarang')
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

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        expect.stringContaining('username tidak tersedia')
      );
    });
  });
});
