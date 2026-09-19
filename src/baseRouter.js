import { Router } from 'express';
import TaskRouter from './routes/task/router.js';
const router = Router();

router.use('/task', TaskRouter);

export default router;
