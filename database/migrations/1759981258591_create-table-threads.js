exports.up = (pgm) => {
  pgm.createTable('threads', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
    body: {
      type: 'TEXT',
      notNull: true,
    },
    owner_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      default: pgm.func('CURRENT_TIMESTAMP'),
    }
  }, { ifNotExists: true });

  pgm.addConstraint('threads', 'threads_owner_id_fkey', {
    foreignKeys: {
      columns: 'owner_id',
      references: 'users(id)',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    }
  }, { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropConstraint('threads', 'threads_owner_id_fkey', { ifExists: true });
  pgm.dropTable('threads', { ifExists: true });
};
