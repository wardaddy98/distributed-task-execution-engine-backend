import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import rateLimiter from '../../middlewares/rateLimiter.js';
import validateSchema from '../../middlewares/validateSchema.js';
import { createTaskSchema } from '../../validations/task.validation.js';
import { handleCancelTask, handleCreateTask, handleGetTasks } from './controller.js';
const router = Router();

router
    .route('/')
    .post(validateSchema(createTaskSchema), authenticate, rateLimiter, handleCreateTask)
    .get(handleGetTasks);

router
    .route('/cancel/:taskId')
    .patch(authenticate, handleCancelTask)

export default router;
