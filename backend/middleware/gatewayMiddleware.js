const ApiKey = require('../models/ApiKey');
const Api = require('../models/Api');
const redisClient = require('../config/redis');

const gatewayAuthAndRateLimit = async (req, res, next) => {
  try {
    const apiId = req.params.apiId;
    const keyString = req.headers['x-api-key'];

    if (!keyString) {
      return res.status(401).json({ success: false, message: 'Missing x-api-key header' });
    }

    // 1. Validate API Key from DB (or Cache in a production scenario)
    const apiKey = await ApiKey.findOne({ key: keyString, apiId });

    if (!apiKey) {
      return res.status(401).json({ success: false, message: 'Invalid API Key' });
    }

    if (apiKey.status !== 'active') {
      return res.status(403).json({ success: false, message: 'API Key is revoked' });
    }

    // Fetch API details for forwarding
    const apiDetails = await Api.findById(apiId);
    if (!apiDetails) {
      return res.status(404).json({ success: false, message: 'Target API not found' });
    }

    // 2. Rate Limiting via Redis
    // Key format: rate_limit:{apiKey}_{minute}
    const currentMinute = new Date().getMinutes();
    const rateLimitKey = `rate_limit:${keyString}_${currentMinute}`;

    const requestCount = await redisClient.incr(rateLimitKey);

    // If it's the first request in this minute, set expiration
    if (requestCount === 1) {
      await redisClient.expire(rateLimitKey, 60); // Expire in 60 seconds
    }

    if (requestCount > apiKey.rateLimit) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    // 3. Attach metadata to request for the forwarding controller
    req.gateway = {
      apiKey: apiKey,
      apiDetails: apiDetails,
    };

    next();
  } catch (error) {
    console.error('Gateway Middleware Error:', error);
    res.status(500).json({ success: false, message: 'Gateway Error' });
  }
};

module.exports = { gatewayAuthAndRateLimit };
