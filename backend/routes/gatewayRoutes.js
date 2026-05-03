const express = require('express');
const { gatewayAuthAndRateLimit } = require('../middleware/gatewayMiddleware');
const { forwardRequest } = require('../controllers/gatewayController');

const router = express.Router();

// The catch-all route for the gateway
router.all('/:apiId/*path', gatewayAuthAndRateLimit, forwardRequest);
// Handle exact /:apiId as well if no trailing slash or path is provided
router.all('/:apiId', gatewayAuthAndRateLimit, forwardRequest);

module.exports = router;
