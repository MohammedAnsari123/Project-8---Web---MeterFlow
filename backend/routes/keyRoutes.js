const express = require('express');
const {
  generateKey,
  getKeys,
  revokeKey,
  rotateKey,
  deleteKey,
  renameKey
} = require('../controllers/keyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes protected
router.use(authorize('owner', 'admin')); // Only owners and admins can manage keys

router.post('/:apiId/generate', generateKey);
router.get('/:apiId', getKeys);
router.patch('/:keyId/revoke', revokeKey);
router.patch('/:keyId/rotate', rotateKey);
router.patch('/:keyId/rename', renameKey);
router.delete('/:keyId', deleteKey);

module.exports = router;
