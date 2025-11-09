const { createServer } = require('../server');

describe('[Integration] HTTP server', () => {
  it('should response 404 when request unregistered route', async () => {
    const server = await createServer({});

    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    expect(response.statusCode).toBe(404);
  });

  it('should handle server error correctly', async () => {
    const server = await createServer({});

    server.route([{
      method: 'GET',
      path: '/error',
      handler: () => {
        let error;
        return error.trigger();
      }
    }]);

    const response = await server.inject({
      method: 'GET',
      url: '/error',
    });
    expect(response.statusCode).toBe(500);

    const resJson = JSON.parse(response.payload);
    expect(resJson).toStrictEqual({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });
});