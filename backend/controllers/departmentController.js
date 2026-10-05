const Department = require('../models/Department');
const Employee = require('../models/Employee');

// @desc    Get all departments (Optimized with Single Aggregation)
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res, next) => {
  try {
    const [departments, countsAggregation] = await Promise.all([
      Department.find()
        .populate('manager', 'firstName lastName email designation')
        .sort({ name: 1 })
        .lean(),
      Employee.aggregate([
        { $match: { department: { $ne: null } } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = {};
    countsAggregation.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const departmentsWithCounts = departments.map((dept) => ({
      ...dept,
      employeeCount: countMap[dept._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      count: departmentsWithCounts.length,
      data: departmentsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      'manager',
      'firstName lastName email designation'
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    const employeeCount = await Employee.countDocuments({ department: department._id });
    const result = department.toObject();
    result.employeeCount = employeeCount;

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin / HR)
const createDepartment = async (req, res, next) => {
  try {
    const { name, description, manager } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required',
      });
    }

    const existing = await Department.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A department with this name already exists',
      });
    }

    const department = await Department.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      manager: manager || undefined,
    });

    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin / HR)
const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, manager } = req.body;

    if (name && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Department name cannot be empty',
      });
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        manager: manager || undefined,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('manager', 'firstName lastName email designation');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department with relational protection
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Protect relational integrity: Prevent deletion if active employees belong to department
    const employeeCount = await Employee.countDocuments({ department: department._id });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department "${department.name}" because it has ${employeeCount} assigned employee(s). Please reassign or remove them first.`,
      });
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
