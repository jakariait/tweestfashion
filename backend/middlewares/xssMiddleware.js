function xssMiddleware(req, res, next) {
  const xss = require('xss');

  function sanitizeValue(value) {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return xss(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => sanitizeValue(item));
    }

    if (typeof value === 'object') {
      const sanitized = {};
      for (const key of Object.keys(value)) {
        sanitized[xss(key)] = sanitizeValue(value[key]);
      }
      return sanitized;
    }

    return value;
  }

  function sanitizeObjectRecursive(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    for (const key of Object.keys(obj)) {
      obj[key] = sanitizeValue(obj[key]);
      if (obj[key] && typeof obj[key] === 'object') {
        sanitizeObjectRecursive(obj[key]);
      }
    }
    return obj;
  }

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObjectRecursive(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      req.query[key] = sanitizeValue(req.query[key]);
    }
  }

  if (req.params && typeof req.params === 'object') {
    for (const key of Object.keys(req.params)) {
      req.params[key] = sanitizeValue(req.params[key]);
    }
  }

  next();
}

module.exports = xssMiddleware;
