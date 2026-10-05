const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All employee routes require authentication

router.route('/')
  .get(getEmployees)
  .post(authorize('admin', 'hr'), createEmployee);

router.route('/:id')
  .get(getEmployeeById)
  .put(authorize('admin', 'hr'), updateEmployee)
  .delete(authorize('admin'), deleteEmployee);

module.exports = router;
