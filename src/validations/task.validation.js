import Joi from 'joi';
import Task from '../database/models/task.model.js';

const taskTypes = Task.getAttributes().type.type.values;

export const createTaskSchema = Joi.object({
  type: Joi.string()
    .valid(...taskTypes)
    .required(),
  clientId: Joi.string().required(),
  priority: Joi.number().integer().min(1).max(5).required(),
  payload: Joi.object().default({}),
});
