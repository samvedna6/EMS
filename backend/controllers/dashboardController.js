const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Task = require('../models/Task');

// @desc    Get comprehensive dashboard statistics (Optimized with Promise.all and Aggregation)
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Task filter based on user role
    const taskFilter = {};
    if (req.user.role === 'employee') {
      taskFilter.assignedTo = req.user._id;
    }

    // Execute independent database queries concurrently in parallel
    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      presentToday,
      pendingLeaves,
      approvedLeaves,
      totalTasks,
      pendingTasks,
      activeTasks,
      completedTasks,
      failedTasks,
      recentTasks,
      departments,
      deptCountsAggregation,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'Active' }),
      Department.countDocuments(),
      Attendance.countDocuments({
        date: todayStr,
        status: { $in: ['Present', 'Half Day'] },
      }),
      Leave.countDocuments({ status: 'Pending' }),
      Leave.countDocuments({ status: 'Approved' }),
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'pending' }),
      Task.countDocuments({ ...taskFilter, status: 'active' }),
      Task.countDocuments({ ...taskFilter, status: 'completed' }),
      Task.countDocuments({ ...taskFilter, status: 'failed' }),
      Task.find(taskFilter)
        .populate('assignedTo', 'name username')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Department.find().select('name').lean(),
      Employee.aggregate([
        { $match: { department: { $ne: null } } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
      ]),
    ]);

    const inactiveEmployees = Math.max(0, totalEmployees - activeEmployees);
    const absentToday = Math.max(0, activeEmployees - presentToday);

    // Map department counts using the single aggregation result
    const deptCountMap = {};
    deptCountsAggregation.forEach((item) => {
      deptCountMap[item._id.toString()] = item.count;
    });

    const departmentsWithCounts = departments.map((dept) => ({
      _id: dept._id,
      name: dept.name,
      employeeCount: deptCountMap[dept._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        totalDepartments,
        presentToday,
        absentToday,
        pendingLeaves,
        approvedLeaves,
        tasks: {
          total: totalTasks,
          pending: pendingTasks,
          active: activeTasks,
          completed: completedTasks,
          failed: failedTasks,
        },
        departments: departmentsWithCounts,
        recentTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
