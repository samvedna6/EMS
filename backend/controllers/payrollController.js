const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

// @desc    Get payroll records
// @route   GET /api/payroll
// @access  Private (Admin / HR)
const getPayrolls = async (req, res, next) => {
  try {
    const { month, year, employee } = req.query;
    const query = {};

    if (month) query.month = month;
    if (year) query.year = parseInt(year, 10);
    if (employee) query.employee = employee;

    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName employeeId designation salary department')
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Generate payroll entry
// @route   POST /api/payroll
// @access  Private (Admin / HR)
const generatePayroll = async (req, res, next) => {
  try {
    const { employeeId, month, year, allowances = 0, deductions = 0, paymentStatus = 'Pending' } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const basicSalary = employee.salary || 0;
    const netSalary = Number(basicSalary) + Number(allowances) - Number(deductions);

    let payroll = await Payroll.findOne({
      employee: employee._id,
      month,
      year: parseInt(year, 10),
    });

    if (payroll) {
      payroll.basicSalary = basicSalary;
      payroll.allowances = allowances;
      payroll.deductions = deductions;
      payroll.netSalary = netSalary;
      payroll.paymentStatus = paymentStatus;
      if (paymentStatus === 'Paid') payroll.paymentDate = new Date();
      await payroll.save();
    } else {
      payroll = await Payroll.create({
        employee: employee._id,
        month,
        year: parseInt(year, 10),
        basicSalary,
        allowances,
        deductions,
        netSalary,
        paymentStatus,
        paymentDate: paymentStatus === 'Paid' ? new Date() : undefined,
      });
    }

    const populated = await Payroll.findById(payroll._id).populate(
      'employee',
      'firstName lastName employeeId designation'
    );

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in employee's payroll
// @route   GET /api/payroll/my
// @access  Private
const getMyPayroll = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile linked to your account',
      });
    }

    const payrolls = await Payroll.find({ employee: employee._id }).sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayrolls,
  generatePayroll,
  getMyPayroll,
};
