const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalRequests: {
    type: Number,
    default: 0,
  },
  amount: {
    type: Number,
    default: 0,
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free',
  },
  billingPeriod: {
    type: String, // e.g., '2023-10' for October 2023
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);
