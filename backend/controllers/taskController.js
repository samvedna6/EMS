const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get all tasks (Admin sees all, Employee sees assigned)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    let query = {};

    // If regular employee, only show their tasks
    if (req.user.role === 'employee') {
      query.assignedTo = req.user._id;
    } else if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name username email')
      .populate('assignedBy', 'name username')
      .sort({ createdAt: -1 });

    // Format tasks to ensure compatibility with existing frontend expectations
    const formatted = tasks.map((t) => ({
      id: t._id.toString(),
      _id: t._id.toString(),
      title: t.title,
      description: t.description,
      assignedTo: t.assignedTo ? t.assignedTo._id.toString() : 'unknown',
      assignedToUser: t.assignedTo,
      assignedBy: t.assignedBy ? t.assignedBy._id.toString() : 'unknown',
      assignedByUser: t.assignedBy,
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name username email')
      .populate('assignedBy', 'name username');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Role check: employee can only view their own
    if (
      req.user.role === 'employee' &&
      task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: task._id.toString(),
        _id: task._id.toString(),
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo ? task.assignedTo._id.toString() : 'unknown',
        assignedToUser: task.assignedTo,
        assignedBy: task.assignedBy ? task.assignedBy._id.toString() : 'unknown',
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin / HR)
const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;

    if (!title || !title.trim() || !description || !description.trim() || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide non-empty title, description, and assigned employee/user ID',
      });
    }

    let parsedDueDate = undefined;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid due date format',
        });
      }
    }

    // Find the user to assign to
    const targetUser = await User.findById(assignedTo);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Assigned employee/user does not exist',
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      assignedTo: targetUser._id,
      assignedBy: req.user._id,
      dueDate: parsedDueDate,
      status: 'pending',
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name username email')
      .populate('assignedBy', 'name username');

    res.status(201).json({
      success: true,
      data: {
        id: populated._id.toString(),
        _id: populated._id.toString(),
        title: populated.title,
        description: populated.description,
        assignedTo: populated.assignedTo ? populated.assignedTo._id.toString() : 'unknown',
        assignedToUser: populated.assignedTo,
        assignedBy: populated.assignedBy ? populated.assignedBy._id.toString() : 'unknown',
        status: populated.status,
        dueDate: populated.dueDate ? populated.dueDate.toISOString() : undefined,
        createdAt: populated.createdAt.toISOString(),
        updatedAt: populated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'active', 'completed', 'failed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // If employee, check if task is assigned to them
    if (
      req.user.role === 'employee' &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only update status for tasks assigned to you',
      });
    }

    task.status = status;
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name username email')
      .populate('assignedBy', 'name username');

    res.status(200).json({
      success: true,
      data: {
        id: populated._id.toString(),
        _id: populated._id.toString(),
        title: populated.title,
        description: populated.description,
        assignedTo: populated.assignedTo ? populated.assignedTo._id.toString() : 'unknown',
        assignedToUser: populated.assignedTo,
        assignedBy: populated.assignedBy ? populated.assignedBy._id.toString() : 'unknown',
        status: populated.status,
        dueDate: populated.dueDate ? populated.dueDate.toISOString() : undefined,
        createdAt: populated.createdAt.toISOString(),
        updatedAt: populated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task successfully removed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  deleteTask,
};
