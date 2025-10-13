const { createServer } = require('../server');

describe('Threads endpoint', () => {
  describe('POST /threads', () => {
    it('should response 401 when request with no authentication', async () => {
      const server = await createServer({});

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson).toEqual(
        expect.objectContaining({
          error: expect.stringContaining('Unauthorized'),
          message: expect.stringContaining('Missing authentication'),
        })
      );
    });
  });
});