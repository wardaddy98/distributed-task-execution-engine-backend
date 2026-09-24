import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const Task = sequelize.define(
  'Task',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    apiKey: {
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
      validate: { min: 1, max: 5 },
    },
    payload: {
      type: DataTypes.JSON,
      defaultValue: {},
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
      validate: { min: 0, max: 100 },
    },
    retries: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    // lastError: {
    //   type: DataTypes.TEXT,
    //   allowNull: true,
    // },
    // workerId: {
    //   type: DataTypes.STRING(64),
    //   allowNull: true,
    // },
  },
  {
    tableName: 'tasks',
    timestamps: true,
    // indexes: [
    //   {
    //     name: 'tasks_dequeue_idx',
    //     fields: ['status', { name: 'priority', order: 'DESC' }, 'createdAt'],
    //   },
    //   { name: 'tasks_client_created_idx', fields: ['clientId', 'createdAt'] },
    //   { name: 'tasks_type_idx', fields: ['type'] },
    //   { name: 'tasks_created_at_idx', fields: ['createdAt'] },
    // ],
  },
);

export default Task;
