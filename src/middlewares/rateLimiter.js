import constants from '../../constants.js';
import { TooManyRequestsError } from './handleError.js';

const timeWindow = 60 * 1000;

const map = new Map();

const rateLimiter = (req, res, next) => {
  const apiKey = req.apiKey;
  const now = Date.now();

  const timestamps = (map.get(apiKey) || []).filter(
    timestamp => now - timestamp < timeWindow,
  );

  if (timestamps.length >= constants.MAX_REQUESTS) {
    throw new TooManyRequestsError('Rate limit exceeded: max 10 tasks per minute');
  }

  timestamps.push(now);
  map.set(apiKey, timestamps);
  next();
};

export default rateLimiter;
