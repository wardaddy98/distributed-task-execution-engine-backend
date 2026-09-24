import { StatusCodes } from 'http-status-codes';
import { workerPool } from '../../../index.js';
import { handleResponse } from '../../utils/handleResponse.js';
import { cancelTask, createTask, fairnessMechanism, queryTasks } from './service.js';



export const handleCreateTask = async (req, res) => {
    const apiKey = req.apiKey;

    await fairnessMechanism(apiKey);

    const task = await createTask({ ...req.body, apiKey });

    const result = await workerPool.queueTask(task);
    return handleResponse(res, StatusCodes.OK, 'Task completed Successfully', result);
};


export const handleCancelTask = async (req, res) => {
    const { taskId } = req.params;

    const task = await cancelTask(taskId);

    return handleResponse(res, StatusCodes.OK, 'Task cancelled Successfully', task);

}

export const handleGetTasks = async (req, res) => {
    const queryOptions = req.query;
    const tasks = await queryTasks(queryOptions);
    return handleResponse(res, StatusCodes.OK, 'Task loaded Successfully', tasks);
};
