/**
 * Zod validation middleware factory.
 * Takes a Zod schema and returns an Express middleware that validates req.body.
 * On failure: returns 400 with structured error details.
 * On success: passes through to next handler.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));

      return res.status(400).json({
        error: 'Validierungsfehler',
        details: errors,
      });
    }

    // Replace req.body with parsed (and coerced) data
    req.body = result.data;
    next();
  };
}

module.exports = validate;
