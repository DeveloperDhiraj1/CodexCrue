const sendResponse = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(`[Error Log]: ${err.stack}`);
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    statusCode = 409;
    message = 'A record with those unique values already exists.';
  } else if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'Uploaded file exceeds the 2 MB limit.';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'The submitted data is invalid.';
  } else if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    message = 'An internal server error occurred.';
  }

  return sendResponse(res, statusCode, false, message, null);
};

module.exports = errorHandler;
