import { Router } from 'express';
import validateSchema from '../../middlewares/validateSchema.js';
import { createTaskSchema } from '../../validations/task.validation.js';
import { handleCreateTask, handleGetTasks } from './controller.js';
const router = Router();

router
    .route('/')
    .post(validateSchema(createTaskSchema), handleCreateTask)
    .get(handleGetTasks)


export default router;
