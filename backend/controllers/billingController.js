const Billing = require('../models/Billing');
const UsageLog = require('../models/UsageLog');
const Api = require('../models/Api');

// Example pricing logic:
// Free plan: 1000 requests free, then $0.005 per request
// Pro plan: $10/mo, 10000 requests free, then $0.002 per request

// @desc    Calculate and generate invoice for current month
// @route   POST /api/v1/billing/calculate
// @access  Private
const calculateBilling = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentDate = new Date();
    const billingPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Get all APIs for the user
    const userApis = await Api.find({ userId }).select('_id');
    const apiIds = userApis.map(api => api._id);

    // Calculate usage for this period
    // Simple approach: calculate from start of month to end of month
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const summary = await UsageLog.aggregate([
      { $match: { apiId: { $in: apiIds }, timestamp: { $gte: startOfMonth } } },
      { $group: { _id: null, totalRequests: { $sum: 1 } } }
    ]);

    const totalRequests = summary.length > 0 ? summary[0].totalRequests : 0;

    // Retrieve user's current billing plan (hardcoding to 'free' for MVP)
    // In real app, fetch from User or Subscription model
    const plan = 'free'; 
    let amount = 0;

    if (plan === 'free') {
      const freeTier = 1000;
      const rate = 0.005; // $0.005 per request
      if (totalRequests > freeTier) {
        amount = (totalRequests - freeTier) * rate;
      }
    }

    // Upsert Billing Record
    const billing = await Billing.findOneAndUpdate(
      { userId, billingPeriod },
      { totalRequests, amount, plan, status: amount > 0 ? 'pending' : 'paid' },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: billing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get billing summary / history
// @route   GET /api/v1/billing/summary
// @access  Private
const getBillingSummary = async (req, res) => {
  try {
    const bills = await Billing.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  calculateBilling,
  getBillingSummary
};
