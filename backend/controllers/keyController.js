const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');
const Api = require('../models/Api');

// Generate a secure API Key
const generateSecureKey = () => {
  return 'mf_' + crypto.randomBytes(24).toString('hex');
};

// @desc    Generate a new API key
// @route   POST /api/v1/keys/:apiId/generate
// @access  Private
const generateKey = async (req, res) => {
  try {
    const api = await Api.findById(req.params.apiId);

    if (!api) {
      return res.status(404).json({ success: false, message: 'API not found' });
    }

    if (api.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const keyString = generateSecureKey();

    const apiKey = await ApiKey.create({
      apiId: api._id,
      userId: req.user._id,
      name: req.body?.name || 'Default Key',
      key: keyString,
      rateLimit: req.body?.rateLimit || 1000
    });

    res.status(201).json({ success: true, data: apiKey });
  } catch (error) {
    console.error('generateKey error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all keys for an API
// @route   GET /api/v1/keys/:apiId
// @access  Private
const getKeys = async (req, res) => {
  try {
    const api = await Api.findById(req.params.apiId);

    if (!api) {
      return res.status(404).json({ success: false, message: 'API not found' });
    }

    if (api.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const keys = await ApiKey.find({ apiId: req.params.apiId });
    res.status(200).json({ success: true, count: keys.length, data: keys });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Revoke an API key
// @route   PATCH /api/v1/keys/:keyId/revoke
// @access  Private
const revokeKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.keyId);

    if (!apiKey) {
      return res.status(404).json({ success: false, message: 'API Key not found' });
    }

    if (apiKey.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    apiKey.status = 'revoked';
    await apiKey.save();

    res.status(200).json({ success: true, data: apiKey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rotate an API key (Revoke old, issue new)
// @route   PATCH /api/v1/keys/:keyId/rotate
// @access  Private
const rotateKey = async (req, res) => {
  try {
    const oldKey = await ApiKey.findById(req.params.keyId);

    if (!oldKey) {
      return res.status(404).json({ success: false, message: 'API Key not found' });
    }

    if (oldKey.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Revoke old key
    oldKey.status = 'revoked';
    await oldKey.save();

    // Generate new key
    const keyString = generateSecureKey();
    const newKey = await ApiKey.create({
      apiId: oldKey.apiId,
      userId: oldKey.userId,
      key: keyString,
      rateLimit: oldKey.rateLimit
    });

    res.status(201).json({ success: true, data: newKey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an API key
// @route   DELETE /api/v1/keys/:keyId
// @access  Private
const deleteKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.keyId);

    if (!apiKey) {
      return res.status(404).json({ success: false, message: 'API Key not found' });
    }

    if (apiKey.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await apiKey.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rename an API key
// @route   PATCH /api/v1/keys/:keyId/rename
// @access  Private
const renameKey = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a valid name' });
    }

    const apiKey = await ApiKey.findById(req.params.keyId);

    if (!apiKey) {
      return res.status(404).json({ success: false, message: 'API Key not found' });
    }

    if (apiKey.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    apiKey.name = name;
    await apiKey.save();

    res.status(200).json({ success: true, data: apiKey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateKey,
  getKeys,
  revokeKey,
  rotateKey,
  deleteKey,
  renameKey
};
