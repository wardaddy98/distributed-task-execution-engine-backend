import { Op } from "sequelize"
import Task from "../../database/models/task.model.js"
import handlePagination from "../../utils/handlePagination.js"

export const createTask = async (payload) => {
    const task = await Task.create(payload, { raw: true })
    return task
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