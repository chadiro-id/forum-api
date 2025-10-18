const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const config = require('../../Commons/config');
const ClientError = require('../../Commons/exceptions/ClientError');
// const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');

const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const threads = require('../../Interfaces/http/api/threads');
const comments = require('../../Interfaces/http/api/comments');
const replies = require('../../Interfaces/http/api/replies');

const usersValidator = require('../validator/users');
const authenticationsValidator = require('../validator/authentications');
const threadsValidator = require('../validator/threads');
const commentsValidator = require('../validator/comments');
const repliesValidator = require('../validator/replies');

const createServer = async (container) => {
  const server = Hapi.server({
    host: config.app.host,
    port: config.app.port,
    debug: config.app.debug,
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('forumapi_jwt', 'jwt', {
    keys: config.tokenize.accessTokenKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.tokenize.accessTokenAge,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: users,
      options: {
        container,
        validator: usersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        container,
        validator: authenticationsValidator,
      },
    },
    {
      plugin: threads,
      options: {
        container,
        validator: threadsValidator,
      },
    },
    {
      plugin: comments,
      options: {
        container,
        validator: commentsValidator,
      },
    },
    {
      plugin: replies,
      options: {
        container,
        validator: repliesValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // const translatedError = DomainErrorTranslator.translate(response);

      // if (translatedError instanceof ClientError) {
      //   const newResponse = h.response({
      //     status: 'fail',
      //     message: translatedError.message,
      //   });

      //   newResponse.code(translatedError.statusCode);
      //   return newResponse;
      // }

      // if (!translatedError.isServer) {
      //   return h.continue;
      // }

      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });

        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      // console.error('[server] on pre response -> error:', translatedError.message);

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });

      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  return server;
};

module.exports = { createServer };