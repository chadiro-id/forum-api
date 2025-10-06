const pool = require('../../database/postgres/pool');
const AuthenticationsTestHelper = require('../../../../tests/AuthenticationsTestHelper');
const UsersTestHelper = require('../../../../tests/UsersTestHelper');
const container = require('../../dependency/container');
const { createServer } = require('../server');

describe('/authentications endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTestHelper.cleanTable();
    await AuthenticationsTestHelper.cleanTable();
  });

  describe('when POST /authentications', () => {
    it('should response 201 and new authentication', async () => {
      // Arrange
      const requestPayload = {
        username: 'forumapi',
        password: 'secret',
      };
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'forumapi',
          password: 'secret',
          fullname: 'Forum Api',
        },
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.accessToken).toBeDefined();
      expect(responseJson.data.refreshToken).toBeDefined();
    });
  });
});