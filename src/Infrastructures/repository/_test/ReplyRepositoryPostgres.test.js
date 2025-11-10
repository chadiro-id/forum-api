const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const ReplyOwner = require('../../../Domains/replies/entities/ReplyOwner');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const { createRawReply } = require('../../../../tests/util');
const { assertQueryCalled, assertDBError } = require('../../../../tests/helper/assertionsHelper');

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
          'reply-123', 'comment-123', 'user-123', 'Sebuah balasan', new Date()
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
        expect(addedReply).toBeInstanceOf(AddedReply);

        assertQueryCalled(mockPool.query, expectedQueryText, expectedQueryValues);
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
        expect(replies).toHaveLength(2);

        assertQueryCalled(mockPool.query, expectedQueryText, [['comment-101', 'comment-102']]);
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

        assertQueryCalled(
          mockPool.query, expectedQueryText, ['reply-001', 'comment-001', 'thread-001']
        );
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = replyRepo.getReplyForDeletion('reply-id', 'comment-id', 'thread-id');
        await assertDBError(promise);
      });
    });

    describe('softDeleteReplyById', () => {
      it('should correctly call pool.query', async () => {
        const expectedQueryText = 'UPDATE replies SET is_delete = TRUE WHERE id = $1';
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'reply-123' }],
          rowCount: 1
        });

        await replyRepo.softDeleteReplyById('reply-123');
        assertQueryCalled(mockPool.query, expectedQueryText, ['reply-123']);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = replyRepo.softDeleteReplyById('id');
        await assertDBError(promise);
      });
    });
  });
});