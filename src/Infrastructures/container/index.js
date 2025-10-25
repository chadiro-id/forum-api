const { createContainer } = require('instances-container');

const defaultOption = require('./option');
const usersOption = require('./users/option');
const authenticationsOption = require('./authentications/option');
const threadsOption = require('./threads/option');
const commentsOption = require('./comments/option');
const repliesOption = require('./replies/option');

const container = () => {
  const options = [
    defaultOption,
    usersOption,
    authenticationsOption,
    threadsOption,
    commentsOption,
    repliesOption,
  ];

  return createContainer(options.flat());
};

module.exports = container;
