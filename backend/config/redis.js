const Redis = require('ioredis');

// Connect to default local Redis or using environment variable
const redisClient = new Redis(process.env.REDIS_URL , {
  maxRetriesPerRequest: null
});

redisClient.on('connect', () => {
  console.log('Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = redisClient;
