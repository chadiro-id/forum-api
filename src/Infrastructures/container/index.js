const { createContainer } = require('instances-container');

const defaultOption = require('./options/default');
const usersOption = require('./options/users');
const authenticationsOption = require('./options/authentications');
const threadsOption = require('./options/threads');
const commentsOption = require('./options/comments');
const repliesOption = require('./options/replies');

let container;
function setup() {
  const options = [
    defaultOption,
    usersOption,
    authenticationsOption,
    threadsOption,
    commentsOption,
    repliesOption,
  ];
  container = createContainer(options.flat());
};
setup();

module.exports = container;
