const pool = require('../../database/postgres/pool');
const { usersTable } = require('../../../../tests/database/postgres');
const container = require('../../containers/container');
const { createServer } = require('../server');

describe('/users endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await usersTable.clean();
  });

  describe('when POST /users', () => {
    it('should response 201 and persisted user', async () => {
      const requestPayload = {
        username: 'forumapi',
        password: 'supersecret^_^@01',
        fullname: 'Forum Api',
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedUser).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        fullname: 'Forum Api',
        password: 'supersecret^_^@01',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        username: 'forumapi',
        password: 'supersecret^_^@01',
        fullname: ['Forum Api'],
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat user baru karena tipe data tidak sesuai');
    });

    it('should response 400 when username more than 50 character', async () => {
      const requestPayload = {
        username: 'forumapiforumapiforumapiforumapiforumapiforumapiforumapi',
        password: 'supersecret^_^@01',
        fullname: 'Forum Api',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat user baru karena karakter username melebihi batas limit');
    });

    it('should response 400 when username contain restricted character', async () => {
      const requestPayload = {
        username: 'forum api',
        password: 'supersecret^_^@01',
        fullname: 'Forum Api',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat user baru karena username mengandung karakter terlarang');
    });

    it('should response 400 when username unavailable', async () => {
      await usersTable.addUser({ username: 'forumapi' });
      const requestPayload = {
        username: 'forumapi',
        fullname: 'Forum Api',
        password: 'super_secret',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('username tidak tersedia');
    });
  });
});
