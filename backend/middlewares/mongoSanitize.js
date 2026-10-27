function sanitizeObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else {
        sanitizeObject(obj[key]);
      }
    }
  }
}

function customMongoSanitize(req, res, next) {
  if (req.query) {
    sanitizeObject(req.query);
  }
  if (req.body) {
    sanitizeObject(req.body);
  }
  if (req.params) {
    sanitizeObject(req.params);
  }
  if (req.headers) {
    sanitizeObject(req.headers);
  }
  next();
}

module.exports = customMongoSanitize;
