const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const Reply = require('../../../Domains/replies/entities/Reply');
const ReplyOwner = require('../../../Domains/replies/entities/ReplyOwner');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const { createRawReply } = require('../../../../tests/util');
const { assertQueryCalled, assertDBError } = require('../../../../tests/helper/assertionsHelper');
require('../../../../tests/matcher/queryMatcher');

describe('[Mock-Based Integration] ReplyRepositoryPostgres', () => {
  it('must be an instance of ReplyRepository', () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, () => '');
    expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepository);
  });

  describe('Postgres Interaction', () => {
    let mockPool;
    let dbError;
    let replyRepo;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };
      dbError = new Error('Database fails');
      replyRepo = new ReplyRepositoryPostgres(mockPool, () => '123');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addReply', () => {
      it('should correctly call pool.query', async () => {
        const expectedQueryText =
          `
          INSERT INTO replies
            (id, comment_id, owner_id, content, created_at)
          VALUES
            ($1, $2, $3, $4, $5)
          RETURNING
            id, content, owner_id
          `;
        const expectedQueryValues = [
          'reply-123', 'comment-123', 'user-123', 'Sebuah balasan', expect.any(Date)
        ];
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'reply-123', content: 'Sebuah balasan', owner_id: 'user-123' }],
          rowCount: 1,
        });

        const addedReply = await replyRepo.addReply(new NewReply({
          threadId: 'thread-123',
          commentId: 'comment-123',
          content: 'Sebuah balasan',
          userId: 'user-123',
        }));

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenLastCalledWith({
          text: expect.toMatchQueryText(expectedQueryText),
          values: expectedQueryValues,
        });

        expect(addedReply).toBeInstanceOf(AddedReply);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = replyRepo.addReply({});
        await assertDBError(promise);
      });
    });

    describe('getRepliesByCommentIds', () => {
      it('should correctly call pool.query', async () => {
        const expectedQueryText =
          `
          SELECT
            r.id, r.content, r.comment_id, r.created_at, r.is_delete, u.username
          FROM
            replies r
          LEFT JOIN
            users u
          ON
            u.id = r.owner_id
          WHERE
            r.comment_id = ANY($1::text[])
          ORDER BY
            r.created_at ASC
          `;
        const reply1 = createRawReply({ id: 'reply-101', comment_id: 'comment-101', username: 'whoami' });
        const reply2 = createRawReply({ id: 'reply-102', comment_id: 'comment-102', is_delete: true });

        mockPool.query.mockResolvedValue({
          rows: [reply1, reply2],
          rowCount: 2,
        });

        const replies = await replyRepo.getRepliesByCommentIds(['comment-101', 'comment-102']);
        expect(replies).toStrictEqual([
          new Reply({
            id: reply1.id,
            commentId: reply1.comment_id,
            content: reply1.content,
            username: reply1.username,
            date: reply1.created_at,
            isDelete: reply1.is_delete,
          }),
          new Reply({
            id: reply2.id,
            commentId: reply2.comment_id,
            content: reply2.content,
            username: reply2.username,
            date: reply2.created_at,
            isDelete: reply2.is_delete,
          }),
        ]);

        expect(mockPool.query).toHaveBeenCalledWith({
          text: expect.toMatchQueryText(expectedQueryText),
          values: [['comment-101', 'comment-102']],
        });
      });

      it('should return an empty array when no reply found', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        const replies = await replyRepo.getRepliesByCommentIds(['comment-101', 'comment-102']);
        expect(replies).toEqual([]);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = replyRepo.getRepliesByCommentIds([]);
        await assertDBError(promise);
      });
    });

    describe('getReplyForDeletion', () => {
      it('should correctly call pool.query', async () => {
        const expectedQueryText =
          `
          SELECT r.owner_id
          FROM replies r
          JOIN comments c ON r.comment_id = c.id
          WHERE r.id = $1
            AND r.comment_id = $2
            AND c.thread_id = $3
          `;
        mockPool.query.mockResolvedValue({
          rows: [{ owner_id: 'user-001' }],
          rowCount: 1,
        });

        const reply = await replyRepo.getReplyForDeletion('reply-001', 'comment-001', 'thread-001');
        expect(reply).toStrictEqual(new ReplyOwner({ owner: 'user-001' }));

        expect(mockPool.query).toHaveBeenCalledWith({
          text: expect.toMatchQueryText(expectedQueryText),
          values: ['reply-001', 'comment-001', 'thread-001'],
        });
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = replyRepo.getReplyForDeletion('reply-id', 'comment-id', 'thread-id');
        await assertDBError(promise);
      });
    });

    describe('softDeleteReplyById', () => {
      it('should correctly call pool.query', async () => {
        const calledQuery = {
          text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1',
          values: ['reply-123'],
        };
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'reply-123' }],
          rowCount: 1
        });

        await replyRepo.softDeleteReplyById('reply-123');
        assertQueryCalled(mockPool.query, calledQuery);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = replyRepo.softDeleteReplyById('id');
        await assertDBError(promise);
      });
    });
  });
});