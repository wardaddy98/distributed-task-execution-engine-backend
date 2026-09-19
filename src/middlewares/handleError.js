import { StatusCodes } from 'http-status-codes';
import { handleResponse } from '../utils/handleResponse.js';

export class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class BadRequestError extends ApiError {
    constructor(message) {
        super(message, StatusCodes.BAD_REQUEST);
    }
}

export class UnAuthorizedError extends ApiError {
    constructor(message) {
        super(message, StatusCodes.UNAUTHORIZED);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message) {
        super(message, StatusCodes.FORBIDDEN);
    }
}

export class NotFoundError extends ApiError {
    constructor(message) {
        super(message, StatusCodes.NOT_FOUND);
    }
}

export class InternalServerError extends ApiError {
    constructor(message = 'An Unexpected error has occurred!') {
        super(message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

// Express identifies error middleware by its 4-argument signature, so `next` must stay.
export function handleError(error, req, res, next) {
    if (error instanceof ApiError) {
        handleResponse(res, error.statusCode, error.message);
    } else {
        console.error('Internal Server Error', error);
        handleResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'An Unexpected error has occurred!');
    }
}
