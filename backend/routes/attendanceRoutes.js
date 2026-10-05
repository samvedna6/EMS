const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getMyAttendance,
  checkIn,
  checkOut,
  markAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my', getMyAttendance);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);

router.get('/', authorize('admin', 'hr'), getAttendance);
router.post('/mark', authorize('admin', 'hr'), markAttendance);

module.exports = router;
