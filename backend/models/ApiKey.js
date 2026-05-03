const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  apiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Api',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    default: 'Default Key',
  },
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active',
  },
  rateLimit: {
    type: Number,
    default: 1000, // 1000 requests per minute by default
  },
}, { timestamps: true });

module.exports = mongoose.model('ApiKey', apiKeySchema);
