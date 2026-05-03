const Api = require('../models/Api');
const ApiKey = require('../models/ApiKey');

// @desc    Create new API
// @route   POST /api/v1/apis
// @access  Private (Owner/Admin)
const createApi = async (req, res) => {
  try {
    const { name, baseUrl, description } = req.body;

    const api = await Api.create({
      userId: req.user._id,
      name,
      baseUrl,
      description,
    });

    res.status(201).json({ success: true, data: api });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all APIs for logged in user
// @route   GET /api/v1/apis
// @access  Private
const getApis = async (req, res) => {
  try {
    const apis = await Api.find({ userId: req.user._id });
    res.status(200).json({ success: true, count: apis.length, data: apis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single API
// @route   GET /api/v1/apis/:id
// @access  Private
const getApiById = async (req, res) => {
  try {
    const api = await Api.findById(req.params.id);

    if (!api) {
      return res.status(404).json({ success: false, message: 'API not found' });
    }

    // Make sure user owns the API
    if (api.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: api });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update API
// @route   PUT /api/v1/apis/:id
// @access  Private
const updateApi = async (req, res) => {
  try {
    let api = await Api.findById(req.params.id);

    if (!api) {
      return res.status(404).json({ success: false, message: 'API not found' });
    }

    if (api.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    api = await Api.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: api });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete API
// @route   DELETE /api/v1/apis/:id
// @access  Private
const deleteApi = async (req, res) => {
  try {
    const api = await Api.findById(req.params.id);

    if (!api) {
      return res.status(404).json({ success: false, message: 'API not found' });
    }

    if (api.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Also delete associated keys
    await ApiKey.deleteMany({ apiId: req.params.id });
    await api.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createApi,
  getApis,
  getApiById,
  updateApi,
  deleteApi
};
