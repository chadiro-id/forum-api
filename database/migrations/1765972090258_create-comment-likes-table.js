/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.createConstraint('comment_likes', 'comment_likes_comment_id_fkey', {
    foreignKeys: {
      columns: 'comment_id',
      references: 'comments(id)',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  });

  pgm.createConstraint('comment_likes', 'comment_likes_user_id_fkey', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  });

  pgm.createConstraint('comment_likes', 'comment_likes_comment_id_user_id_key', {
    unique: ['comment_id', 'user_id'],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint('comment_likes', 'comment_likes_comment_id_user_id_key');
  pgm.dropConstraint('comment_likes', 'comment_likes_user_id_fkey');
  pgm.dropConstraint('comment_likes', 'comment_likes_comment_id_fkey');
  pgm.dropTable('comment_likes');
};
