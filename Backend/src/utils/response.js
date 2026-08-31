const sendResponse = (res, statusCode, success, message, data = null, meta) => {
  const response = {
    success,
    message,
    data
  };
  if (meta !== undefined) response.meta = meta;
  return res.status(statusCode).json(response);
};

module.exports = sendResponse;
