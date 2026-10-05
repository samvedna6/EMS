const express = require('express');
const router = express.Router();
const {
  getPayrolls,
  generatePayroll,
  getMyPayroll,
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my', getMyPayroll);

router.route('/')
  .get(authorize('admin', 'hr'), getPayrolls)
  .post(authorize('admin', 'hr'), generatePayroll);

module.exports = router;
