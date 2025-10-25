const { nanoid } = require('nanoid');
const pool = require('../database/postgres/pool');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const CommentRepositoryPostgres = require('../../Infrastructures/repository/CommentRepositoryPostgres');
const AddCommentUseCase = require('../../Applications/use_case/comments/AddCommentUseCase');
const DeleteCommentUseCase = require('../../Applications/use_case/comments/DeleteCommentUseCase');

const setup = (container) => {
  container.register([
    {
      key: CommentRepository.name,
      Class: CommentRepositoryPostgres,
      parameter: {
        dependencies: [
          {
            concrete: pool,
          },
          {
            concrete: nanoid,
          },
        ],
      },
    },
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
    {
      key: DeleteCommentUseCase.name,
      Class: DeleteCommentUseCase,
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