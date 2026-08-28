const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || (statusCode === 401 ? 'UNAUTHORIZED' : statusCode === 404 ? 'NOT_FOUND' : 'SERVER_ERROR');

  console.error(`[Error] ${req.method} ${req.originalUrl} - [${errorCode}]: ${err.message}`);

  return res.status(statusCode).json({
    success: false,
    code: errorCode,
    message: err.message || 'An unexpected error occurred on the server',
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
  });
};

module.exports = errorHandler;
