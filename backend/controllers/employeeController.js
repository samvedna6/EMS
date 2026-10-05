const Employee = require('../models/Employee');
const User = require('../models/User');
const Department = require('../models/Department');
const Task = require('../models/Task');

// @desc    Get all employees with search, filter, pagination
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res, next) => {
  try {
    const { search, department, status, designation, page = 1, limit = 50 } = req.query;

    const query = {};

    // Search keyword across multiple fields
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { designation: searchRegex },
      ];
    }

    // Filter by department
    if (department && department !== 'all') {
      query.department = department;
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by designation
    if (designation && designation !== 'all') {
      query.designation = new RegExp(designation, 'i');
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Employee.countDocuments(query);

    const employees = await Employee.find(query)
      .populate('department', 'name description')
      .populate('user', 'username role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name description')
      .populate('user', 'username role');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin / HR)
const createEmployee = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      department,
      designation,
      joiningDate,
      salary,
      employmentType,
      status,
      emergencyContact,
      username,
      password,
    } = req.body;

    if (!firstName || !lastName || !email || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide firstName, lastName, email, and designation',
      });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    if (salary !== undefined && (isNaN(Number(salary)) || Number(salary) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Salary must be a non-negative number',
      });
    }

    // Check email uniqueness
    const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists',
      });
    }

    // Auto-generate employeeId if not provided
    let empId = req.body.employeeId;
    if (!empId) {
      const count = await Employee.countDocuments();
      empId = `EMP${String(count + 1).padStart(4, '0')}`;
    }

    // Create user login account for employee
    const uName = (username || `${firstName.toLowerCase()}_${lastName.toLowerCase()}`).replace(/\s+/g, '');
    let existingUser = await User.findOne({ username: uName });
    let finalUsername = uName;
    if (existingUser) {
      finalUsername = `${uName}_${Math.floor(100 + Math.random() * 900)}`;
    }

    const newUser = await User.create({
      name: `${firstName} ${lastName}`,
      username: finalUsername,
      email: email.toLowerCase(),
      password: password || 'password',
      role: 'employee',
    });

    const employee = await Employee.create({
      user: newUser._id,
      employeeId: empId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      dateOfBirth,
      gender: gender || 'Other',
      address,
      department: department || undefined,
      designation,
      joiningDate: joiningDate || Date.now(),
      salary: Number(salary) || 0,
      employmentType: employmentType || 'Full-Time',
      status: status || 'Active',
      emergencyContact,
    });

    // Link user to employee profile
    newUser.employeeProfile = employee._id;
    await newUser.save();

    // Update department employee count if department provided
    if (department) {
      const count = await Employee.countDocuments({ department });
      await Department.findByIdAndUpdate(department, { employeeCount: count });
    }

    const populated = await Employee.findById(employee._id)
      .populate('department', 'name')
      .populate('user', 'username role');

    res.status(201).json({
      success: true,
      message: 'Employee and user account created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin / HR)
const updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    if (req.body.email) {
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
      if (!emailRegex.test(req.body.email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
        });
      }
    }

    if (req.body.salary !== undefined && (isNaN(Number(req.body.salary)) || Number(req.body.salary) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Salary must be a non-negative number',
      });
    }

    const oldDept = employee.department;

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('department', 'name')
      .populate('user', 'username role');

    // Update department counts if department changed
    if (req.body.department && req.body.department !== (oldDept && oldDept.toString())) {
      if (oldDept) {
        const countOld = await Employee.countDocuments({ department: oldDept });
        await Department.findByIdAndUpdate(oldDept, { employeeCount: countOld });
      }
      const countNew = await Employee.countDocuments({ department: req.body.department });
      await Department.findByIdAndUpdate(req.body.department, { employeeCount: countNew });
    }

    // Sync user's name if first or last name changed
    if (employee.user && (req.body.firstName || req.body.lastName)) {
      await User.findByIdAndUpdate(employee.user._id, {
        name: `${employee.firstName} ${employee.lastName}`,
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee with relational cleanup
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const deptId = employee.department;

    // Relational cleanup: Unset manager reference in any department this employee managed
    await Department.updateMany({ manager: employee._id }, { $unset: { manager: '' } });

    // Remove linked user account and unassign pending tasks
    if (employee.user) {
      await Task.deleteMany({ assignedTo: employee.user, status: 'pending' });
      await User.findByIdAndDelete(employee.user);
    }

    await employee.deleteOne();

    // Update department count
    if (deptId) {
      const count = await Employee.countDocuments({ department: deptId });
      await Department.findByIdAndUpdate(deptId, { employeeCount: count });
    }

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
