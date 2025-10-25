const { createContainer } = require('instances-container');

const defaultOption = require('./options/default');
const usersOption = require('./options/users');
const authenticationsOption = require('./options/authentications');
const threadsOption = require('./options/threads');
const commentsOption = require('./options/comments');
const repliesOption = require('./options/replies');

const setupContainer = () => {
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

const container = setupContainer();

module.exports = container;
