function errorHandler(err, req, res, next) {
  console.error(err.stack || err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
}

module.exports = errorHandler;
