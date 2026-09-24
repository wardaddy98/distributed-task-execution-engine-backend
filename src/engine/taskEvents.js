import { EventEmitter } from 'events';

// In-process bus for task changes; each open SSE connection (GET /task/events) adds a listener.
export const taskEvents = new EventEmitter();
taskEvents.setMaxListeners(0);

export const emitTaskUpdate = task => taskEvents.emit('task', task.toJSON());
