import _ from "lodash"
import { Op } from "sequelize"
import Task from "../../database/models/task.model.js"
import { BadRequestError } from "../../middlewares/handleError.js"
import handlePagination from "../../utils/handlePagination.js"

export const createTask = async (payload) => {
    const task = Task.build(payload)
    await task.save();
    return task
}

export const cancelTask = async (taskId) => {
    const task = await Task.findByPk(taskId);

    if (_.isEmpty(task)) {
        throw new BadRequestError('Task does not exist!')
    }

    await task.update({ status: 'cancelled' });
    return task
}


export const fairnessMechanism = async (apiKey) => {
    //if last 10 queued tasks have more than 4 tasks by current user with priority greater than 3, current request is denied

    const priorityThreshold = 3;
    const maximumHighPriorityTasks = 4;

    //last 10 tasks with status queued
    const recentQueuedTasks = await Task.findAll({
        where: { status: 'queued' },
        order: [['createdAt', 'DESC']],
        limit: 10,
    });

    const clientHighPriorityCount = recentQueuedTasks.filter(
        task => task.apiKey === apiKey && task.priority > priorityThreshold,
    ).length;

    if (clientHighPriorityCount > maximumHighPriorityTasks) {
        throw new TooManyRequestsError(
            `You already have ${clientHighPriorityCount} high-priority tasks among the last 10 queued tasks - wait for some to finish before submitting more`,
        );
    }
}


export const queryAllTasks = async () => {
    return Task.findAll({
        order: [['createdAt', 'DESC']]
    })
}

export const queryTasks = async (queryOptions = {}) => {

    const { status, priority, startDate, endDate, type, page, limit } = queryOptions

    const filterOptions = {}

    if (status) filterOptions.status = status
    if (type) filterOptions.type = type
    if (priority) filterOptions.priority = Number(priority)

    if (startDate || endDate) {
        filterOptions.createdAt = {}

        if (startDate) filterOptions.createdAt[Op.gte] = new Date(startDate)

        if (endDate) {
            filterOptions.createdAt[Op.lte] = new Date(endDate)
        }
    }

    const paginatedTasks = await handlePagination(
        Task,
        page,
        filterOptions,
        limit ? Number(limit) : undefined,
    )

    return paginatedTasks

}