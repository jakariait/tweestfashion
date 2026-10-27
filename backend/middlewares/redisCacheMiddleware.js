const redisClient = require('../config/redisClient');

const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;

  redisClient.get(key, (err, data) => {
    if (err) {
      console.error('Redis error:', err);
      return next();
    }

    if (data !== null) {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(data);
    } else {
      const originalSend = res.send;
      res.send = (body) => {
        redisClient.set(key, body, 'EX', 3600); // Cache for 1 hour
        originalSend.call(res, body);
      };
      next();
    }
  });
};

module.exports = cacheMiddleware;
