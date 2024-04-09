export function serverErrorHandler(err, res) {
  console.error(err);
  res.status(500).json(err);
}

export function errorHandler(res, message, statusCode) {
  res.status(statusCode).json(message);
}
