import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { Attendance } from '../models/Attendance.js';
import { Query } from '../models/Query.js';
import {
  calculatePerformanceScore,
  getWeekDateRange,
  formatDateKey,
} from '../utils/performanceCalculator.js';

// Get individual employee's performance score & breakdown
export const getEmployeePerformance = async (req, res) => {
  try {
    const targetUserId = req.params.employeeId || req.user._id;

    // Authorization: employees can only view their own score unless admin or manager
    if (
      req.user.role === 'employee' &&
      targetUserId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied to view other employee performance' });
    }

    const employee = await User.findById(targetUserId).select('-password');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (employee.companyDomain !== req.user.companyDomain) {
      return res.status(403).json({ success: false, message: 'Access denied. Cross-company access forbidden.' });
    }

    const { startOfWeek, endOfWeek } = getWeekDateRange();

    // 1. Fetch employee's tasks within company
    const tasks = await Task.find({ assignedTo: targetUserId, companyDomain: req.user.companyDomain });

    // 2. Fetch employee's attendance sessions this week
    const attendances = await Attendance.find({
      user: targetUserId,
      companyDomain: req.user.companyDomain,
      punchIn: { $gte: startOfWeek, $lte: endOfWeek },
    });

    let weeklyDurationMinutes = 0;
    attendances.forEach((a) => {
      if (a.status === 'completed') {
        weeklyDurationMinutes += a.durationMinutes;
      } else if (a.status === 'active') {
        const elapsed = Math.round((Date.now() - new Date(a.punchIn).getTime()) / 60000);
        weeklyDurationMinutes += Math.max(0, elapsed);
      }
    });

    // 3. Fetch employee's queries
    const queries = await Query.find({ raisedBy: targetUserId, companyDomain: req.user.companyDomain });

    // 4. Calculate performance score
    const performance = calculatePerformanceScore({
      tasks,
      weeklyDurationMinutes,
      targetWeeklyHours: employee.weeklyTargetHours || 40,
      queries,
    });

    res.json({
      success: true,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        designation: employee.designation,
        weeklyTargetHours: employee.weeklyTargetHours,
        avatar: employee.avatar,
        companyDomain: employee.companyDomain,
        companyName: employee.companyName,
      },
      performance,
      recentTasks: tasks.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Manager & Admin: Complete Team Performance Leaderboard and Analytics
export const getTeamPerformanceOverview = async (req, res) => {
  try {
    const { department } = req.query;
    const userFilter = {
      role: 'employee',
      isActive: true,
      companyDomain: req.user.companyDomain,
    };
    if (department && department !== 'all') userFilter.department = department;

    const employees = await User.find(userFilter).select('-password').sort({ name: 1 });
    const { startOfWeek, endOfWeek } = getWeekDateRange();

    // Batch fetch data for employees in this company
    const allTasks = await Task.find({ companyDomain: req.user.companyDomain });
    const allWeeklyAttendances = await Attendance.find({
      companyDomain: req.user.companyDomain,
      punchIn: { $gte: startOfWeek, $lte: endOfWeek },
    });
    const allQueries = await Query.find({ companyDomain: req.user.companyDomain });

    const employeeAnalytics = employees.map((emp) => {
      const empTasks = allTasks.filter((t) => t.assignedTo.toString() === emp._id.toString());
      const empAttendances = allWeeklyAttendances.filter((a) => a.user.toString() === emp._id.toString());
      const empQueries = allQueries.filter((q) => q.raisedBy.toString() === emp._id.toString());

      let weeklyDurationMinutes = 0;
      empAttendances.forEach((a) => {
        if (a.status === 'completed') {
          weeklyDurationMinutes += a.durationMinutes;
        } else if (a.status === 'active') {
          const elapsed = Math.round((Date.now() - new Date(a.punchIn).getTime()) / 60000);
          weeklyDurationMinutes += Math.max(0, elapsed);
        }
      });

      const performance = calculatePerformanceScore({
        tasks: empTasks,
        weeklyDurationMinutes,
        targetWeeklyHours: emp.weeklyTargetHours || 40,
        queries: empQueries,
      });

      return {
        id: emp._id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        avatar: emp.avatar,
        weeklyTargetHours: emp.weeklyTargetHours,
        performance,
      };
    });

    // Sort by performance score descending (Leaderboard)
    employeeAnalytics.sort((a, b) => b.performance.score - a.performance.score);

    // Compute aggregated averages
    const totalScore = employeeAnalytics.reduce((sum, e) => sum + e.performance.score, 0);
    const averageScore = employeeAnalytics.length > 0 ? Math.round(totalScore / employeeAnalytics.length) : 0;

    const totalHoursWorked = employeeAnalytics.reduce(
      (sum, e) => sum + (e.performance.metrics.weeklyHoursLogged || 0),
      0
    );

    res.json({
      success: true,
      count: employeeAnalytics.length,
      averageScore,
      totalHoursWorked: parseFloat(totalHoursWorked.toFixed(1)),
      leaderboard: employeeAnalytics,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin & Manager: High-level overview metrics
export const getDashboardSummary = async (req, res) => {
  try {
    const todayStr = formatDateKey(new Date());
    const { startOfWeek, endOfWeek } = getWeekDateRange();
    const companyDomain = req.user.companyDomain;

    const [
      totalEmployees,
      totalManagers,
      clockedInCount,
      tasksTotal,
      tasksCompleted,
      tasksInProgress,
      queriesOpen,
      weeklyAttendances,
    ] = await Promise.all([
      User.countDocuments({ role: 'employee', isActive: true, companyDomain }),
      User.countDocuments({ role: 'manager', isActive: true, companyDomain }),
      Attendance.countDocuments({ status: 'active', companyDomain }),
      Task.countDocuments({ companyDomain }),
      Task.countDocuments({ status: 'completed', companyDomain }),
      Task.countDocuments({ status: { $in: ['in_progress', 'in_review'] }, companyDomain }),
      Query.countDocuments({ status: { $in: ['open', 'in_review'] }, companyDomain }),
      Attendance.find({ companyDomain, punchIn: { $gte: startOfWeek, $lte: endOfWeek } }),
    ]);

    let weeklyTotalMinutes = 0;
    weeklyAttendances.forEach((a) => {
      if (a.status === 'completed') {
        weeklyTotalMinutes += a.durationMinutes;
      } else if (a.status === 'active') {
        const elapsed = Math.round((Date.now() - new Date(a.punchIn).getTime()) / 60000);
        weeklyTotalMinutes += Math.max(0, elapsed);
      }
    });

    res.json({
      success: true,
      stats: {
        totalEmployees,
        totalManagers,
        clockedInCount,
        tasksTotal,
        tasksCompleted,
        tasksInProgress,
        queriesOpen,
        weeklyTotalHours: parseFloat((weeklyTotalMinutes / 60).toFixed(1)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
