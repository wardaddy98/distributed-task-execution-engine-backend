import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import rateLimiter from '../../middlewares/rateLimiter.js';
import validateSchema from '../../middlewares/validateSchema.js';
import { createTaskSchema } from '../../validations/task.validation.js';
import { handleCancelTask, handleCreateTask, handleGetAllTasks, handleGetTasks, handleRetryTask, handleTaskEvents } from './controller.js';
const router = Router();

//frontend subscribes to this sse endpoint /task/events
router.get('/events', handleTaskEvents);

router
    .route('/')
    .post(validateSchema(createTaskSchema), authenticate, rateLimiter, handleCreateTask)
    .get(handleGetTasks);

router.route('/all')
    .get(handleGetAllTasks);

router
    .route('/cancel/:taskId')
    .patch(authenticate, handleCancelTask)

router
    .route('/retry/:taskId')
    .patch(authenticate, handleRetryTask)

export default router;
