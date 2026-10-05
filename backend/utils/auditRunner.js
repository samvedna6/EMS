const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const API_BASE = 'http://localhost:5000/api';

const results = {
  passed: 0,
  failed: 0,
  details: [],
};

const assert = (condition, title, details = '') => {
  if (condition) {
    results.passed++;
    results.details.push({ status: 'PASS', title, details });
    console.log(`  [PASS] ${title}`);
  } else {
    results.failed++;
    results.details.push({ status: 'FAIL', title, details });
    console.error(`  [FAIL] ${title} - ${details}`);
  }
};

async function runAudit() {
  console.log('================================================================');
  console.log('       STARTING TASKFLOW EMS FULL-STACK AUDIT & TEST SUITE      ');
  console.log('================================================================\n');

  try {
    // 1. HEALTH & CONNECTIVITY
    console.log('Section 1: Server Connectivity');
    const health = await axios.get(`${API_BASE}/health`);
    assert(health.status === 200 && health.data.status === 'online', 'Backend health check responds with 200 OK');

    // 2. AUTHENTICATION & SESSIONS
    console.log('\nSection 2: Authentication & Role Sessions');
    
    // Admin Login
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'password',
    });
    assert(adminLogin.data.success && adminLogin.data.user.role === 'admin', 'Admin login succeeds with role "admin"');
    const adminToken = adminLogin.data.token;
    assert(typeof adminToken === 'string' && adminToken.length > 20, 'JWT token returned for admin');

    const adminMe = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminMe.data.user.username === 'admin', 'Protected /api/auth/me returns admin profile');

    // HR Login
    const hrLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'hr@taskflow.com',
      password: 'password',
    });
    assert(hrLogin.data.success && hrLogin.data.user.role === 'hr', 'HR login succeeds via email with role "hr"');
    const hrToken = hrLogin.data.token;

    // Employee Login
    const empLogin = await axios.post(`${API_BASE}/auth/login`, {
      username: 'samvedna_kumari',
      password: 'password',
    });
    assert(empLogin.data.success && empLogin.data.user.role === 'employee', 'Employee login succeeds with role "employee"');
    const empToken = empLogin.data.token;
    const empUserId = empLogin.data.user.id || empLogin.data.user._id;

    // 3. ROLE-BASED ACCESS CONTROL (RBAC)
    console.log('\nSection 3: Role-Based Authorization');
    
    // Admin authorized to view staff
    const adminStaff = await axios.get(`${API_BASE}/employees`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminStaff.status === 200, 'Admin is authorized to view employees directory');

    // Employee blocked from creating an employee (must be 403 Forbidden)
    let empBlockedFromCreate = false;
    try {
      await axios.post(`${API_BASE}/employees`, { firstName: 'Unauthorized' }, {
        headers: { Authorization: `Bearer ${empToken}` },
      });
    } catch (err) {
      if (err.response && err.response.status === 403) {
        empBlockedFromCreate = true;
      }
    }
    assert(empBlockedFromCreate, 'Employee is blocked (403 Forbidden) from creating staff');

    // Employee blocked from creating a department (must be 403 Forbidden)
    let empBlockedFromDept = false;
    try {
      await axios.post(`${API_BASE}/departments`, { name: 'Illegal Dept' }, {
        headers: { Authorization: `Bearer ${empToken}` },
      });
    } catch (err) {
      if (err.response && err.response.status === 403) {
        empBlockedFromDept = true;
      }
    }
    assert(empBlockedFromDept, 'Employee is blocked (403 Forbidden) from creating departments');

    // Employee blocked from viewing all leaves (must be 403 Forbidden)
    let empBlockedFromAllLeaves = false;
    try {
      await axios.get(`${API_BASE}/leaves`, {
        headers: { Authorization: `Bearer ${empToken}` },
      });
    } catch (err) {
      if (err.response && err.response.status === 403) {
        empBlockedFromAllLeaves = true;
      }
    }
    assert(empBlockedFromAllLeaves, 'Employee is blocked (403 Forbidden) from viewing all staff leaves');

    // 4. EMPLOYEE MANAGEMENT CRUD
    console.log('\nSection 4: Employee Management CRUD');
    const newEmpPayload = {
      firstName: 'Auditor',
      lastName: 'Inspector',
      email: 'auditor.inspector@taskflow.com',
      phone: '+1 555-9988',
      designation: 'Security Auditor',
      salary: 95000,
      employmentType: 'Full-Time',
      status: 'Active',
    };

    const createdEmpRes = await axios.post(`${API_BASE}/employees`, newEmpPayload, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const createdEmp = createdEmpRes.data.data;
    assert(createdEmp && createdEmp.email === 'auditor.inspector@taskflow.com', 'CREATE: Employee created in MongoDB with generated ID');

    // READ
    const fetchedEmp = await axios.get(`${API_BASE}/employees/${createdEmp._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(fetchedEmp.data.data.firstName === 'Auditor', 'READ: Employee retrieved by ID from MongoDB');

    // UPDATE
    const updatedEmpRes = await axios.put(`${API_BASE}/employees/${createdEmp._id}`, {
      designation: 'Lead Security Auditor',
      phone: '+1 555-7711',
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(updatedEmpRes.data.data.designation === 'Lead Security Auditor', 'UPDATE: Employee designation updated in MongoDB');

    // DELETE
    const deleteEmpRes = await axios.delete(`${API_BASE}/employees/${createdEmp._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteEmpRes.data.success, 'DELETE: Employee deleted successfully');

    // Verify gone
    let empFoundAfterDelete = true;
    try {
      await axios.get(`${API_BASE}/employees/${createdEmp._id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    } catch (e) {
      if (e.response && e.response.status === 404) {
        empFoundAfterDelete = false;
      }
    }
    assert(!empFoundAfterDelete, 'Verified employee is completely removed from MongoDB (404)');

    // 5. SEARCH AND FILTER
    console.log('\nSection 5: Search and Filtering');
    const searchRes = await axios.get(`${API_BASE}/employees?search=Samvedna`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(searchRes.data.data.length > 0 && searchRes.data.data[0].firstName === 'Samvedna', 'Search by keyword finds matching employees');

    const statusFilter = await axios.get(`${API_BASE}/employees?status=Active`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(statusFilter.data.data.every(e => e.status === 'Active'), 'Filter by status returns only active employees');

    // 6. DEPARTMENT MANAGEMENT & DYNAMIC STAFF COUNTS
    console.log('\nSection 6: Department Management & Dynamic Counts');
    const newDeptRes = await axios.post(`${API_BASE}/departments`, {
      name: 'Cybersecurity Audit',
      description: 'Security testing and compliance operations',
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const testDept = newDeptRes.data.data;
    assert(testDept && testDept.name === 'Cybersecurity Audit', 'CREATE: Department created in MongoDB');

    const deptList = await axios.get(`${API_BASE}/departments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const foundDept = deptList.data.data.find(d => d._id === testDept._id);
    assert(foundDept && foundDept.employeeCount === 0, 'Dynamic count: New department shows 0 employees');

    await axios.delete(`${API_BASE}/departments/${testDept._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(true, 'DELETE: Cleaned up test department');

    // 7. ATTENDANCE & UNIQUE CONSTRAINTS
    console.log('\nSection 7: Attendance & Daily Constraints');
    const myAtt = await axios.get(`${API_BASE}/attendance/my`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    assert(Array.isArray(myAtt.data.data), 'Employee attendance history loaded');

    // Check check-in functionality or duplicate handling
    let checkInHandled = false;
    try {
      const punch = await axios.post(`${API_BASE}/attendance/check-in`, {}, {
        headers: { Authorization: `Bearer ${empToken}` },
      });
      if (punch.data.success) checkInHandled = true;
    } catch (err) {
      if (err.response && (err.response.status === 400 || err.response.data.message?.includes('already checked in'))) {
        checkInHandled = true; // Already checked in today, duplicate prevented
      }
    }
    assert(checkInHandled, 'Check-in or duplicate prevention enforced for same day');

    // Admin mark attendance override
    const allEmployees = await axios.get(`${API_BASE}/employees?limit=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const targetStaffId = allEmployees.data.data[0]._id;

    const markRes = await axios.post(`${API_BASE}/attendance/mark`, {
      employeeId: targetStaffId,
      status: 'Present',
      notes: 'Audited attendance record',
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(markRes.data.success && markRes.data.data.status === 'Present', 'Admin successfully marked attendance in MongoDB');

    // 8. LEAVE MANAGEMENT LIFECYCLE
    console.log('\nSection 8: Leave Management Lifecycle (Apply -> Approve -> Reject)');
    const applyRes = await axios.post(`${API_BASE}/leaves`, {
      leaveType: 'Casual',
      startDate: new Date(Date.now() + 86400000 * 10).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 12).toISOString(),
      reason: 'Audit verification leave application',
    }, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const createdLeave = applyRes.data.data;
    assert(createdLeave.status === 'Pending', 'Employee applied for leave (Status: "Pending")');

    // Admin approve
    const approveRes = await axios.put(`${API_BASE}/leaves/${createdLeave._id}/status`, {
      status: 'Approved',
      approvalRemarks: 'Approved during test audit',
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(approveRes.data.data.status === 'Approved', 'Admin approved leave (Status: "Approved")');

    // Employee verify status
    const empLeaves = await axios.get(`${API_BASE}/leaves/my`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const verifiedLeave = empLeaves.data.data.find(l => l._id === createdLeave._id);
    assert(verifiedLeave && verifiedLeave.status === 'Approved' && verifiedLeave.approvalRemarks === 'Approved during test audit',
      'Employee sees approved status and manager remarks');

    // Clean up test leave
    await axios.delete(`${API_BASE}/leaves/${createdLeave._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    // 9. TASK MANAGEMENT LIFECYCLE
    console.log('\nSection 9: Task Management Lifecycle');
    const newTask = await axios.post(`${API_BASE}/tasks`, {
      title: 'Audit Verification Task',
      description: 'Complete lifecycle test from Pending to Completed',
      assignedTo: empUserId,
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const taskId = newTask.data.data.id;
    assert(newTask.data.data.status === 'pending', 'Task created by admin with status "pending"');

    // Employee accepts task
    const activeTask = await axios.put(`${API_BASE}/tasks/${taskId}/status`, { status: 'active' }, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    assert(activeTask.data.data.status === 'active', 'Employee updated task to "active"');

    // Employee marks complete
    const completedTask = await axios.put(`${API_BASE}/tasks/${taskId}/status`, { status: 'completed' }, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    assert(completedTask.data.data.status === 'completed', 'Employee marked task "completed"');

    // Admin removes task
    const delTask = await axios.delete(`${API_BASE}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(delTask.data.success, 'Admin deleted task from MongoDB');

    // 10. DASHBOARD STATS CALCULATION
    console.log('\nSection 10: Dashboard Statistics');
    const statsRes = await axios.get(`${API_BASE}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const stats = statsRes.data.data;
    assert(typeof stats.totalEmployees === 'number' && stats.totalEmployees > 0, `Total employees: ${stats.totalEmployees}`);
    assert(typeof stats.totalDepartments === 'number' && stats.totalDepartments > 0, `Total departments: ${stats.totalDepartments}`);
    assert(typeof stats.tasks.total === 'number', `Task counts aggregated from MongoDB: Total ${stats.tasks.total}`);
    assert(Array.isArray(stats.departments) && stats.departments.length > 0, 'Department distribution calculated live');

    // 11. API ERROR HANDLING
    console.log('\nSection 11: Error Handling & Status Codes');
    
    // Invalid JWT
    let invalidJwtCaught = false;
    try {
      await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: 'Bearer invalid.token.value' },
      });
    } catch (e) {
      if (e.response && e.response.status === 401) invalidJwtCaught = true;
    }
    assert(invalidJwtCaught, 'Invalid JWT returns 401 Unauthorized');

    // Missing JWT
    let missingJwtCaught = false;
    try {
      await axios.get(`${API_BASE}/auth/me`);
    } catch (e) {
      if (e.response && e.response.status === 401) missingJwtCaught = true;
    }
    assert(missingJwtCaught, 'Missing JWT returns 401 Unauthorized');

    // Invalid ObjectId format
    let invalidIdCaught = false;
    try {
      await axios.get(`${API_BASE}/employees/12345nonexisting`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    } catch (e) {
      if (e.response && e.response.status === 404) invalidIdCaught = true;
    }
    assert(invalidIdCaught, 'Invalid ObjectId returns 404 Not Found');

    // Missing required fields on employee create
    let missingFieldsCaught = false;
    try {
      await axios.post(`${API_BASE}/employees`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    } catch (e) {
      if (e.response && e.response.status === 400) missingFieldsCaught = true;
    }
    assert(missingFieldsCaught, 'Missing required fields returns 400 Bad Request');

    // Duplicate email
    let dupEmailCaught = false;
    try {
      await axios.post(`${API_BASE}/employees`, {
        firstName: 'Dupe',
        lastName: 'User',
        email: 'ram.sagar@taskflow.com', // Existing email
        designation: 'Engineer',
      }, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    } catch (e) {
      if (e.response && e.response.status === 400) dupEmailCaught = true;
    }
    assert(dupEmailCaught, 'Duplicate employee email returns 400 Bad Request');

    console.log('\n================================================================');
    console.log(` AUDIT COMPLETE: ${results.passed} PASSED | ${results.failed} FAILED`);
    console.log('================================================================\n');

    process.exit(results.failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal audit error:', err.response?.data || err.message);
    process.exit(1);
  }
}

runAudit();
