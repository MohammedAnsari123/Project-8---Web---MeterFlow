const express = require('express');
const { getUsageSummary, getDailyUsage, getRecentLogs } = require('../controllers/usageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes protected

router.get('/summary', getUsageSummary);
router.get('/daily', getDailyUsage);
router.get('/logs', getRecentLogs);

module.exports = router;
