/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    is_delete: {
      type: 'BOOLEAN',
      default: false,
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  }, { ifNotExists: true });

  pgm.createConstraint('replies', 'replies_comment_id_fkey', {
    foreignKeys: {
      columns: 'comment_id',
      references: 'comments(id)',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  }, { ifNotExists: true });

  pgm.createConstraint('replies', 'replies_owner_id_fkey', {
    foreignKeys: {
      columns: 'owner_id',
      references: 'users(id)',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint('replies', 'replies_owner_id_fkey', { ifExists: true });
  pgm.dropConstraint('replies', 'replies_comment_id_fkey', { ifExists: true });
  pgm.dropTable('replies', { ifExists: true });
};
