const UsageLog = require('../models/UsageLog');
const Api = require('../models/Api');

// @desc    Get usage summary (total requests, avg latency, error rate)
// @route   GET /api/v1/usage/summary
// @access  Private
const getUsageSummary = async (req, res) => {
  try {
    // 1. Get all APIs owned by the user
    const userApis = await Api.find({ userId: req.user._id }).select('_id');
    const apiIds = userApis.map(api => api._id);

    // 2. Aggregate metrics from UsageLogs
    const summary = await UsageLog.aggregate([
      { $match: { apiId: { $in: apiIds } } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          avgLatency: { $avg: '$latency' },
          errorCount: {
            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] }
          }
        }
      }
    ]);

    if (summary.length === 0) {
      return res.status(200).json({
        success: true,
        data: { totalRequests: 0, avgLatency: 0, errorRate: 0 }
      });
    }

    const { totalRequests, avgLatency, errorCount } = summary[0];
    const errorRate = (errorCount / totalRequests) * 100;

    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        avgLatency: Math.round(avgLatency),
        errorRate: errorRate.toFixed(2),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get daily usage for charting
// @route   GET /api/v1/usage/daily
// @access  Private
const getDailyUsage = async (req, res) => {
  try {
    const userApis = await Api.find({ userId: req.user._id }).select('_id');
    const apiIds = userApis.map(api => api._id);

    // Last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const daily = await UsageLog.aggregate([
      { $match: { apiId: { $in: apiIds }, timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          requests: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({ success: true, data: daily });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent usage logs
// @route   GET /api/v1/usage/logs
// @access  Private
const getRecentLogs = async (req, res) => {
  try {
    const userApis = await Api.find({ userId: req.user._id }).select('_id');
    const apiIds = userApis.map(api => api._id);

    const logs = await UsageLog.find({ apiId: { $in: apiIds } })
      .populate('apiId', 'name baseUrl')
      .populate('keyId', 'name')
      .sort({ timestamp: -1 })
      .limit(50); // Get latest 50 logs

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsageSummary,
  getDailyUsage,
  getRecentLogs
};
