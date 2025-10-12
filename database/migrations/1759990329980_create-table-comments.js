exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    is_delete: {
      type: 'BOOLEAN',
      default: false,
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      default: pgm.func('CURRENT_TIMESTAMP'),
    }
  }, { ifNotExists: true });

  pgm.createConstraint('comments', 'comments_thread_id_fkey', {
    foreignKeys: {
      columns: 'thread_id',
      references: 'threads(id)',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    }
  }, { ifNotExists: true });

  pgm.createConstraint('comments', 'comments_owner_id_fkey', {
    foreignKeys: {
      columns: 'owner_id',
      references: 'users(id)',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    }
  }, { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropConstraint('comments', 'comments_owner_id_fkey', { ifExists: true });
  pgm.dropConstraint('comments', 'comments_thread_id_fkey', { ifExists: true });
  pgm.dropTable('comments', { ifExists: true });
};
