const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// @desc    Get all leaves (Admin / HR)
// @route   GET /api/leaves
// @access  Private (Admin / HR)
const getLeaves = async (req, res, next) => {
  try {
    const { status, leaveType } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (leaveType && leaveType !== 'all') {
      query.leaveType = leaveType;
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName email employeeId designation department')
      .populate('user', 'name username')
      .populate('approvedBy', 'name username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in employee's leaves
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to your account',
      });
    }

    const leaves = await Leave.find({ employee: employee._id })
      .populate('approvedBy', 'name username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to your account',
      });
    }

    if (!startDate || !endDate || !reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide start date, end date, and non-empty reason for leave',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start date or end date format',
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Leave start date cannot be after end date',
      });
    }

    const leave = await Leave.create({
      employee: employee._id,
      user: req.user._id,
      leaveType: leaveType || 'Casual',
      startDate: start,
      endDate: end,
      reason: reason.trim(),
      status: 'Pending',
    });

    const populated = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email employeeId designation')
      .populate('user', 'name username');

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve / Reject leave
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin / HR)
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, approvalRemarks } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Approved', 'Rejected', or 'Pending'",
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    if (approvalRemarks) {
      leave.approvalRemarks = approvalRemarks;
    }

    await leave.save();

    const populated = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email employeeId designation')
      .populate('user', 'name username')
      .populate('approvedBy', 'name username');

    res.status(200).json({
      success: true,
      message: `Leave application marked as ${status}`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete leave application
// @route   DELETE /api/leaves/:id
// @access  Private
const deleteLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }

    // Regular employee can only cancel pending leaves of their own
    if (
      req.user.role === 'employee' &&
      (leave.user.toString() !== req.user._id.toString() || leave.status !== 'Pending')
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own pending leave applications',
      });
    }

    await leave.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Leave application removed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaves,
  getMyLeaves,
  applyLeave,
  updateLeaveStatus,
  deleteLeave,
};
