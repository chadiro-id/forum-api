const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const PasswordHash = require('../../Applications/security/PasswordHash');
const AddAuthenticationUseCase = require('../../Applications/use_case/authentications/AddAuthenticationUseCase');
const DeleteAuthenticationUseCase = require('../../Applications/use_case/authentications/DeleteAuthenticationUseCase');
const PutAuthenticationUseCase = require('../../Applications/use_case/authentications/PutAuthenticationUseCase');
const AddCommentUseCase = require('../../Applications/use_case/comments/AddCommentUseCase');
const AddThreadUseCase = require('../../Applications/use_case/threads/AddThreadUseCase');
const AddUserUseCase = require('../../Applications/use_case/users/AddUserUseCase');
const AuthenticationRepository = require('../../Domains/authentications/AuthenticationRepository');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const UserRepository = require('../../Domains/users/UserRepository');

const setup = (container) => {
  container.register([
    {
      key: AddUserUseCase.name,
      Class: AddUserUseCase,
      parameter: {
        injectType: 'destructuring',
        dependencies: [
          {
            name: 'userRepository',
            internal: UserRepository.name,
          },
          {
            name: 'passwordHash',
            internal: PasswordHash.name,
          },
        ],
      },
    },
  ]);

  container.register([
    {
      key: AddAuthenticationUseCase.name,
      Class: AddAuthenticationUseCase,
      parameter: {
        injectType: 'destructuring',
        dependencies: [
          {
            name: 'userRepository',
            internal: UserRepository.name,
          },
          {
            name: 'authenticationRepository',
            internal: AuthenticationRepository.name,
          },
          {
            name: 'authenticationTokenManager',
            internal: AuthenticationTokenManager.name,
          },
          {
            name: 'passwordHash',
            internal: PasswordHash.name,
          },
        ],
      },
    },
    {
      key: PutAuthenticationUseCase.name,
      Class: PutAuthenticationUseCase,
      parameter: {
        injectType: 'destructuring',
        dependencies: [
          {
            name: 'authenticationRepository',
            internal: AuthenticationRepository.name,
          },
          {
            name: 'authenticationTokenManager',
            internal: AuthenticationTokenManager.name,
          },
        ],
      },
    },
    {
      key: DeleteAuthenticationUseCase.name,
      Class: DeleteAuthenticationUseCase,
      parameter: {
        injectType: 'destructuring',
        dependencies: [
          {
            name: 'authenticationRepository',
            internal: AuthenticationRepository.name,
          },
        ],
      },
    },
  ]);

  container.register([
    {
      key: AddThreadUseCase.name,
      Class: AddThreadUseCase,
      parameter: {
        injectType: 'destructuring',
        dependencies: [
          {
            name: 'userRepository',
            internal: UserRepository.name,
          },
          {
            name: 'threadRepository',
            internal: ThreadRepository.name,
          },
        ],
      },
    },
  ]);

  container.register([
    {
      key: AddCommentUseCase.name,
      Class: AddCommentUseCase,
      parameter: {
        injectType: 'destructuring',
        dependencies: [
          {
            name: 'threadRepository',
            internal: ThreadRepository.name,
          },
          {
            name: 'commentRepository',
            internal: CommentRepository.name,
          },
        ],
      },
    },
  ]);
};

module.exports = { setup };