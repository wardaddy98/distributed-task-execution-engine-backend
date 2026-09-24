
import { Router } from 'express';
import { handleWorkerEvents } from './controller.js';
const router = Router();

//frontend subscribes to this sse endpoint /worker/events
router.get('/events', handleWorkerEvents);

export default router;
