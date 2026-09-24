import { EventEmitter } from 'events';

// In-process bus for worker changes; each open SSE connection (GET /worker/events) adds a listener.
export const workerEvents = new EventEmitter();
workerEvents.setMaxListeners(0);

export const emitWorkerUpdate = workerData => workerEvents.emit('worker', workerData);
