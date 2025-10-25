/* istanbul ignore file */
const { createServer } = require('../../src/Infrastructures/http/server');
const container = require('../../src/Infrastructures/containers/container');

let server;

const inject = async (method, url, options) => {
  if (typeof url !== 'string') {
    throw new Error('SERVER_TEST.URL_MUST_BE_STRING');
  }

  if (typeof options !== 'object') {
    throw new Error('SERVER_TEST.OPTIONS_MUST_BE_OBJECT');
  }

  return server.inject({
    ...options,
    method,
    url,
  });
};

exports.init = async () => {
  if (!server) {
    server = await createServer(container);
  }
  await server.initialize();
};

exports.stop = async () => {
  if (!server) {
    throw new Error('SERVER_TEST.SERVER_NOT_SETUP_YET');
  }
  await server.stop();
};

exports.post = async (endpoint, options = {}) => inject('POST', endpoint, options);
exports.get = async (endpoint, options = {}) => inject('GET', endpoint, options);
exports.put = async (endpoint, options = {}) => inject('PUT', endpoint, options);
exports.delete = async (enpoint, options = {}) => inject('DELETE', enpoint, options);
