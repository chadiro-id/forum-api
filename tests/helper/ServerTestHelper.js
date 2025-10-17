/* istanbul ignore file */
const { createServer } = require('../../src/Infrastructures/http/server');
const container = require('../../src/Infrastructures/containers/container');

let server;
let initialized;

const inject = async (method, url, options) => {
  if (typeof url !== 'string') {
    throw new Error('SERVER_TEST.INVALID_URL');
  }

  if (typeof options !== 'object') {
    throw new Error('SERVER_TEST.OPTIONS_MUST_BE_AN_OBJECT');
  }

  return server.inject({
    ...options,
    method,
    url,
  });
};

exports.setup = async () => {
  if (!server) {
    server = await createServer(container);
  }
};

exports.init = async () => {
  if (!server) {
    throw new Error('SERVER_TEST.NOT_FOUND');
  }

  if (initialized) return;
  await server.initialize();
  initialized = true;
};

exports.stop = async () => {
  if (!server) {
    throw new Error('SERVER_TEST.NOT_FOUND');
  }

  await server.stop();
  initialized = false;
};

exports.post = async (endpoint, options = {}) => inject('POST', endpoint, options);
exports.get = async (endpoint, options = {}) => inject('GET', endpoint, options);
exports.put = async (endpoint, options = {}) => inject('PUT', endpoint, options);
exports.delete = async (enpoint, options = {}) => inject('DELETE', enpoint, options);
