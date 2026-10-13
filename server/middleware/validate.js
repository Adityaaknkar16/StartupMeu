const MESSAGES = require('../utils/messages');
const { sendError } = require('../utils/apiResponse');

/**
 * Higher-order middleware function to validate request data against a Zod schema.
 * Formats field-level error messages in a structured array.
 *
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @param {'body' | 'query' | 'params'} source - Part of request to validate (default: 'body')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed; // Store cleaned & transformed values
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));

        // Pick specific message if available, otherwise general validation failure
        const firstErrorMessage = formattedErrors[0]?.message || MESSAGES.VALIDATION.FAILED;

        return sendError(
          res,
          firstErrorMessage,
          'VALIDATION_ERROR',
          formattedErrors,
          400
        );
      }

      return sendError(
        res,
        MESSAGES.VALIDATION.FAILED,
        'VALIDATION_ERROR',
        [],
        400
      );
    }
  };
};

module.exports = validate;
