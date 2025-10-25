const { createContainer } = require('instances-container');

const defaultOption = require('./option');

const container = () => {
  return createContainer([
    ...defaultOption,
  ]);
};

module.exports = container;
