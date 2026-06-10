const Joi = require('joi');

/**
 * Returns Express middleware that validates req.body against the given Joi schema.
 * Strips unknown fields so clients can't inject unexpected properties.
 * On failure, responds with 400 and a detailed message.
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const details = error.details.map((d) => d.message).join('; ');
      return res.status(400).json({ error: `Validation failed: ${details}` });
    }

    // Replace with sanitized value
    req[source] = value;
    next();
  };
}

module.exports = { validate };
