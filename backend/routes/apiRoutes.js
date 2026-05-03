const express = require('express');
const {
  createApi,
  getApis,
  getApiById,
  updateApi,
  deleteApi
} = require('../controllers/apiController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes protected

router
  .route('/')
  .post(authorize('owner', 'admin'), createApi)
  .get(getApis);

router
  .route('/:id')
  .get(getApiById)
  .put(authorize('owner', 'admin'), updateApi)
  .delete(authorize('owner', 'admin'), deleteApi);

module.exports = router;
