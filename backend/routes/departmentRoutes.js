const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All department routes require authentication

router.route('/')
  .get(getDepartments)
  .post(authorize('admin', 'hr'), createDepartment);

router.route('/:id')
  .get(getDepartmentById)
  .put(authorize('admin', 'hr'), updateDepartment)
  .delete(authorize('admin'), deleteDepartment);

module.exports = router;
