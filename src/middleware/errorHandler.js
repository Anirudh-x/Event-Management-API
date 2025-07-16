function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }
  
  // Validation errors
  if (err.array) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        details: err.array().map(e => ({
          field: e.path,
          message: e.msg
        }))
      }
    });
  }
  
  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code || 'APPLICATION_ERROR',
        message: err.message
      }
    });
  }
  
  // Generic server error
  res.status(500).json({
    error: {
      code: 'SERVER_ERROR',
      message: 'Internal server error'
    }
  });
}

function handlePrismaError(err, res) {
  const errors = {
    P2002: {
      status: 409,
      code: 'UNIQUE_CONSTRAINT',
      message: `Unique constraint violation on ${err.meta.target}`
    },
    P2025: {
      status: 404,
      code: 'RECORD_NOT_FOUND',
      message: 'Requested resource not found'
    },
    P2003: {
      status: 400,
      code: 'FOREIGN_KEY_CONSTRAINT',
      message: `Invalid reference: ${err.meta.field_name}`
    }
  };
  
  const errorInfo = errors[err.code] || {
    status: 500,
    code: 'DATABASE_ERROR',
    message: 'Database operation failed'
  };
  
  res.status(errorInfo.status).json({
    error: {
      code: errorInfo.code,
      message: errorInfo.message
    }
  });
}

module.exports = errorHandler;