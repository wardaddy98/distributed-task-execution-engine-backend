import { DataTypes } from 'sequelize';

export const up = async queryInterface => {
  await queryInterface.createTable('tasks', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('image_processing', 'report_generation'),
      allowNull: false,
    },
    priority: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 3,
    },
    // MySQL cannot set a literal default on JSON columns; the model supplies `{}`.
    payload: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('queued', 'running', 'completed', 'cancelled', 'failed', 'dead'),
      allowNull: false,
      defaultValue: 'queued',
    },
    progress: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    retryCount: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    maxRetries: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 3,
    },
    lastError: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    workerId: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    finishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await queryInterface.addIndex(
    'tasks',
    ['status', { name: 'priority', order: 'DESC' }, 'createdAt'],
    {
      name: 'tasks_dequeue_idx',
    },
  );
  await queryInterface.addIndex('tasks', ['clientId', 'createdAt'], {
    name: 'tasks_client_created_idx',
  });
  await queryInterface.addIndex('tasks', ['type'], { name: 'tasks_type_idx' });
  await queryInterface.addIndex('tasks', ['createdAt'], { name: 'tasks_created_at_idx' });
};

export const down = async queryInterface => {
  await queryInterface.dropTable('tasks');
};
