const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

const getTodayDateString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// @desc    Get attendance records (filter by date, employee)
// @route   GET /api/attendance
// @access  Private (Admin / HR)
const getAttendance = async (req, res, next) => {
  try {
    const { date, employee, status } = req.query;
    const query = {};

    if (date) {
      query.date = date;
    }

    if (employee) {
      query.employee = employee;
    }

    if (status) {
      query.status = status;
    }

    const records = await Attendance.find(query)
      .populate('employee', 'firstName lastName email employeeId designation department')
      .populate('user', 'name username')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's attendance
// @route   GET /api/attendance/my
// @access  Private
const getMyAttendance = async (req, res, next) => {
  try {
    // Find employee linked to user
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to your account',
      });
    }

    const records = await Attendance.find({ employee: employee._id })
      .sort({ date: -1 })
      .limit(60);

    const todayStr = getTodayDateString();
    const todayRecord = records.find((r) => r.date === todayStr);

    res.status(200).json({
      success: true,
      today: todayRecord || null,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Employee Check-In
// @route   POST /api/attendance/check-in
// @access  Private
const checkIn = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to your account',
      });
    }

    const todayStr = getTodayDateString();
    let record = await Attendance.findOne({ employee: employee._id, date: todayStr });

    if (record && record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today',
        data: record,
      });
    }

    if (record) {
      record.checkIn = new Date();
      record.status = 'Present';
      await record.save();
    } else {
      record = await Attendance.create({
        employee: employee._id,
        user: req.user._id,
        date: todayStr,
        checkIn: new Date(),
        status: 'Present',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Employee Check-Out
// @route   POST /api/attendance/check-out
// @access  Private
const checkOut = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to your account',
      });
    }

    const todayStr = getTodayDateString();
    let record = await Attendance.findOne({ employee: employee._id, date: todayStr });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'Please check in first before checking out',
      });
    }

    record.checkOut = new Date();
    await record.save();

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin mark/adjust attendance
// @route   POST /api/attendance/mark
// @access  Private (Admin / HR)
const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const attendanceDate = date || getTodayDateString();

    const updateData = {
      status: status || 'Present',
      notes,
    };

    if (checkIn) updateData.checkIn = new Date(checkIn);
    if (checkOut) updateData.checkOut = new Date(checkOut);

    const record = await Attendance.findOneAndUpdate(
      { employee: employee._id, date: attendanceDate },
      {
        ...updateData,
        user: employee.user,
      },
      { upsert: true, new: true, runValidators: true }
    ).populate('employee', 'firstName lastName employeeId designation');

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  getMyAttendance,
  checkIn,
  checkOut,
  markAttendance,
};
