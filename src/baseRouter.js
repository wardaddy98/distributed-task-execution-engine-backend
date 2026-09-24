import { Router } from 'express';
import TaskRouter from './routes/task/router.js';
import WorkerRouter from './routes/worker/router.js';
const router = Router();

router.use('/task', TaskRouter);
router.use('/worker', WorkerRouter);

export default router;
