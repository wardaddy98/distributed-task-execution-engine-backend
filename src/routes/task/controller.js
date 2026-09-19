import { StatusCodes } from "http-status-codes"
import { handleResponse } from "../../utils/handleResponse.js"
import { createTask, queryTasks } from "./service.js"

export const handleCreateTask = async (req, res) => {

    const task = await createTask(req.body)
    return handleResponse(res, StatusCodes.OK, 'Task Created Successfully', task)
}

export const handleGetTasks = async (req, res) => {
    const queryOptions = req.query;
    const tasks = await queryTasks(queryOptions);
    return handleResponse(res, StatusCodes.OK, 'Task loaded Successfully', tasks)

}