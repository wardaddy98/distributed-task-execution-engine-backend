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
      type: DataTypes.ENUM('image_processing', 'report_generation', 'deliberate_fail_task'),
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
  },
  {
    tableName: 'tasks',
    timestamps: true,
  },
);

export default Task;
