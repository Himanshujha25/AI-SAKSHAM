// Wrap async route handlers so errors hit the error middleware.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function notFound(req, res) {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err && err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err && err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate resource' });
  }
  const status = err.statusCode || 500;
  const message = err.message || 'Server error';
  if (status >= 500) console.error(err);
  res.status(status).json({ message });
}

module.exports = { asyncHandler, notFound, errorHandler };
