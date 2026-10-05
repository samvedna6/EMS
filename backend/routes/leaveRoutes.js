const express = require('express');
const router = express.Router();
const {
  getLeaves,
  getMyLeaves,
  applyLeave,
  updateLeaveStatus,
  deleteLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('admin', 'hr'), getLeaves)
  .post(applyLeave);

router.get('/my', getMyLeaves);

router.route('/:id/status')
  .put(authorize('admin', 'hr'), updateLeaveStatus);

router.route('/:id')
  .delete(deleteLeave);

module.exports = router;
