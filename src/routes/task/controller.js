import { StatusCodes } from 'http-status-codes';
import { workerPool } from '../../../index.js';
import { emitTaskUpdate, taskEvents } from '../../engine/taskEvents.js';
import { handleResponse } from '../../utils/handleResponse.js';
import { cancelTask, createTask, fairnessMechanism, queryAllTasks, queryTasks, retryTask } from './service.js';



export const handleCreateTask = async (req, res) => {
    const apiKey = req.apiKey;

    await fairnessMechanism(apiKey);

    const task = await createTask({ ...req.body, apiKey });
    emitTaskUpdate(task);

    workerPool.queueTask(task);

    return handleResponse(res, StatusCodes.OK, 'Task Queued', { taskId: task.id });
};


export const handleCancelTask = async (req, res) => {
    const { taskId } = req.params;

    const task = await cancelTask(taskId, req.apiKey);
    emitTaskUpdate(task);

    await workerPool.cancelTask(task.id)
    return handleResponse(res, StatusCodes.OK, 'Task cancelled Successfully', task);
}

export const handleRetryTask = async (req, res) => {
    const { taskId } = req.params;

    const task = await retryTask(taskId, req.apiKey);
    emitTaskUpdate(task);

    //not awaited, the response is sent once the task is queued; the rejection is already handled by the pool
    workerPool.queueTask(task);
    return handleResponse(res, StatusCodes.OK, 'Task queued for retry', task);
}

export const handleGetTasks = async (req, res) => {
    const queryOptions = req.query;
    const tasks = await queryTasks(queryOptions);
    return handleResponse(res, StatusCodes.OK, 'Task loaded Successfully', tasks);
};

export const handleGetAllTasks = async (req, res) => {
    const tasks = await queryAllTasks();
    return handleResponse(res, StatusCodes.OK, 'Task loaded Successfully', tasks);
};

// SSE stream: pushes every task create/status change to all connected clients.
export const handleTaskEvents = (req, res) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
    });
    res.flushHeaders();
    res.write('retry: 3000\n\n');

    const send = task => res.write(`event: task\ndata: ${JSON.stringify(task)}\n\n`);
    taskEvents.on('task', send);

    // Comment frames keep idle connections from being closed by proxies.
    const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000);

    req.on('close', () => {
        clearInterval(heartbeat);
        taskEvents.off('task', send);
    });
};
