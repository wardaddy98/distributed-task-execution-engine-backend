import { BadRequestError } from './handleError.js';

const validateSchema =
    (schema) =>
        (req, res, next) => {
            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
            });

            if (error) {
                throw new BadRequestError(
                    `Validation failed- ${error.details.map(detail => detail.message).join(',')}`,
                );
            }

            req.body = value;
            next();
        };

export default validateSchema;
