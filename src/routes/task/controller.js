import { StatusCodes } from "http-status-codes";
import { workerPool } from "../../../index.js";
import { handleResponse } from "../../utils/handleResponse.js";
import { createTask, queryTasks } from "./service.js";

export const handleCreateTask = async (req, res) => {
    try {
        const task = await createTask(req.body);

        const result = await workerPool.queueTask(task)
        return handleResponse(res, StatusCodes.OK, 'Task Created Successfully', result)
    } catch (err) {
        throw new InternalServerError('Task Failed')
    }

}

export const handleGetTasks = async (req, res) => {
    const queryOptions = req.query;
    const tasks = await queryTasks(queryOptions);
    return handleResponse(res, StatusCodes.OK, 'Task loaded Successfully', tasks)

}