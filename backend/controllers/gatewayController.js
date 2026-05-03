const axios = require('axios');
const { usageQueue } = require('../queues/usageQueue');

// @desc    Forward requests to target API and log usage
// @route   ALL /api/v1/gateway/:apiId/*
// @access  Public (Requires x-api-key header)
const forwardRequest = async (req, res) => {
  const { apiKey, apiDetails } = req.gateway;
  
  // The rest of the path after :apiId/
  let endpointPath = req.params.path || req.params[0] || '';
  if (Array.isArray(endpointPath)) {
    endpointPath = endpointPath.join('/');
  }
  
  // Construct target URL
  const targetUrl = `${apiDetails.baseUrl.replace(/\/$/, '')}/${endpointPath}`;
  
  // Exclude problematic headers
  const forwardHeaders = { ...req.headers };
  delete forwardHeaders['host'];
  delete forwardHeaders['x-api-key'];
  delete forwardHeaders['content-length'];

  const startTime = Date.now();
  let statusCode = 500;

  try {
    // Forward the request using Axios
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: forwardHeaders,
      data: req.method !== 'GET' ? req.body : undefined,
      params: req.query,
      validateStatus: () => true, // Resolve promise for all status codes
    });

    statusCode = response.status;

    // Send response back to the client
    res.status(statusCode).send(response.data);
    
  } catch (error) {
    console.error('Gateway Forwarding Error:', error.message);
    statusCode = 502; // Bad Gateway
    if (!res.headersSent) {
      res.status(statusCode).json({ success: false, message: 'Bad Gateway - Failed to reach target API' });
    }
  } finally {
    const latency = Date.now() - startTime;

    // Asynchronously log the request to BullMQ
    usageQueue.add('log-request', {
      apiKey: apiKey.key,
      apiId: apiDetails._id,
      endpoint: `/${endpointPath}`,
      method: req.method,
      statusCode,
      latency,
      timestamp: new Date()
    });
  }
};

module.exports = { forwardRequest };
