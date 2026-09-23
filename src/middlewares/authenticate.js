import { ForbiddenError } from './handleError.js';

const authenticate = (req, res, next) => {
    const apiKey = req.headers['api-key'];

    if (!apiKey) {
        throw new ForbiddenError('Api Key missing');
    }

    req.apiKey = apiKey;
    next();
};

export default authenticate;
