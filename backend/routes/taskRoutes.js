const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All task routes require authentication

router.route('/')
  .get(getTasks)
  .post(authorize('admin', 'hr'), createTask);

router.route('/:id')
  .get(getTaskById)
  .delete(authorize('admin', 'hr'), deleteTask);

router.route('/:id/status')
  .put(updateTaskStatus);

module.exports = router;
