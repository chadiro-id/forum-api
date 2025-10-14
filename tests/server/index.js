/* istanbul ignore file */
const { createServer } = require('../../src/Infrastructures/http/server');
const container = require('../../src/Infrastructures/containers/container');

let server;
let initialized;

const inject = async (method, url, headers, payload) => {
  return server.inject({
    method,
    url,
    headers,
    payload,
  });
};

exports.init = async () => {
  if (initialized) return;

  if (!server) {
    server = await createServer(container);
  }

  await server.initialize();
  initialized = true;
};

exports.stop = async () => {
  initialized = false;
  await server.stop();
};

exports.post = async (endpoint, options = {}) => {
  return inject('POST', endpoint, options.headers, options.payload);
};

exports.get = async (endpoint, options = {}) => {
  return inject('GET', endpoint, options.headers);
};

exports.put = async (endpoint, options = {}) => {
  return inject('PUT', endpoint, options.headers, options.payload);
};

exports.delete = async (enpoint, options = {}) => {
  return inject('DELETE', enpoint, options.headers);
};
