const express = require('express');
const { calculateBilling, getBillingSummary } = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/calculate', calculateBilling);
router.get('/summary', getBillingSummary);

module.exports = router;
