const mongoose = require('mongoose');

const apiSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide an API name'],
  },
  baseUrl: {
    type: String,
    required: [true, 'Please provide a base URL'],
    match: [
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      'Please provide a valid URL',
    ],
  },
  description: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Api', apiSchema);
