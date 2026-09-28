import { Attendance } from '../models/Attendance.js';
import { User } from '../models/User.js';
import { getWeekDateRange, formatDateKey } from '../utils/performanceCalculator.js';

// Punch In (Start work shift)
export const punchIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStr = formatDateKey(new Date());

    // Check if there is already an active session
    const existingActive = await Attendance.findOne({
      user: userId,
      status: 'active',
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active work session. Please punch out first before starting a new session.',
        session: existingActive,
      });
    }

    const session = await Attendance.create({
      user: userId,
      companyDomain: req.user.companyDomain,
      date: todayStr,
      punchIn: new Date(),
      status: 'active',
      notes: req.body.notes || 'Normal work shift',
      location: req.body.location || 'Office / Remote',
    });

    res.status(201).json({
      success: true,
      message: 'Punched in successfully. Have a productive shift!',
      session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Punch Out (End work shift)
export const punchOut = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the current active session
    const session = await Attendance.findOne({
      user: userId,
      status: 'active',
    }).sort({ punchIn: -1 });

    if (!session) {
      return res.status(400).json({
        success: false,
        message: 'No active work session found to punch out from.',
      });
    }

    const now = new Date();
    const durationMinutes = Math.max(1, Math.round((now.getTime() - new Date(session.punchIn).getTime()) / 60000));

    session.punchOut = now;
    session.durationMinutes = durationMinutes;
    session.status = 'completed';
    if (req.body.notes) {
      session.notes = req.body.notes;
    }

    await session.save();

    res.json({
      success: true,
      message: 'Punched out successfully. Work shift logged.',
      session,
      durationMinutes,
      durationHours: parseFloat((durationMinutes / 60).toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get today's punch status and active session
export const getTodayStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStr = formatDateKey(new Date());

    const sessions = await Attendance.find({
      user: userId,
      date: todayStr,
    }).sort({ punchIn: 1 });

    const activeSession = sessions.find((s) => s.status === 'active') || null;

    let todayMinutes = 0;
    sessions.forEach((s) => {
      if (s.status === 'completed') {
        todayMinutes += s.durationMinutes;
      } else if (s.status === 'active') {
        const elapsed = Math.round((Date.now() - new Date(s.punchIn).getTime()) / 60000);
        todayMinutes += Math.max(0, elapsed);
      }
    });

    res.json({
      success: true,
      isClockedIn: !!activeSession,
      activeSession,
      todayMinutes,
      todayHours: parseFloat((todayMinutes / 60).toFixed(2)),
      sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get weekly hours and day-by-day breakdown
export const getWeeklyHours = async (req, res) => {
  try {
    const targetUserId = req.query.userId || req.user._id;
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.companyDomain !== req.user.companyDomain) {
      return res.status(403).json({ success: false, message: 'Cross-company data access forbidden' });
    }

    // Role check: non-admins and non-managers cannot view other users' hours
    if (
      req.user.role === 'employee' &&
      targetUserId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view other employee hours' });
    }

    const { startOfWeek, endOfWeek } = getWeekDateRange();

    const sessions = await Attendance.find({
      user: targetUserId,
      companyDomain: req.user.companyDomain,
      punchIn: { $gte: startOfWeek, $lte: endOfWeek },
    }).sort({ punchIn: 1 });

    // Days mapping: Mon, Tue, Wed, Thu, Fri, Sat, Sun
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyBreakdown = dayNames.map((name, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);
      const dateKey = formatDateKey(dayDate);
      return {
        day: name,
        date: dateKey,
        minutes: 0,
        hours: 0,
      };
    });

    let totalMinutes = 0;

    sessions.forEach((s) => {
      let duration = s.durationMinutes;
      if (s.status === 'active') {
        duration = Math.round((Date.now() - new Date(s.punchIn).getTime()) / 60000);
      }
      totalMinutes += duration;

      const dayObj = dailyBreakdown.find((d) => d.date === s.date);
      if (dayObj) {
        dayObj.minutes += duration;
        dayObj.hours = parseFloat((dayObj.minutes / 60).toFixed(2));
      }
    });

    const totalHours = parseFloat((totalMinutes / 60).toFixed(1));
    const targetHours = user.weeklyTargetHours || 40;
    const completionRate = Math.min(100, Math.round((totalHours / targetHours) * 100));

    res.json({
      success: true,
      employee: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        weeklyTargetHours: targetHours,
      },
      weekRange: {
        start: formatDateKey(startOfWeek),
        end: formatDateKey(endOfWeek),
      },
      totalMinutes,
      totalHours,
      targetHours,
      completionRate,
      overtimeHours: totalHours > targetHours ? parseFloat((totalHours - targetHours).toFixed(1)) : 0,
      dailyBreakdown,
      sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Manager/Admin view: Live roster of who is clocked in right now
export const getLiveAttendanceRoster = async (req, res) => {
  try {
    const activeSessions = await Attendance.find({
       status: 'active',
       companyDomain: req.user.companyDomain,
    })
      .populate('user', 'name email department designation avatar')
      .sort({ punchIn: -1 });

    const todayStr = formatDateKey(new Date());
    const allTodaySessions = await Attendance.find({ date: todayStr });

    const clockedInList = activeSessions.map((s) => {
      const elapsedMinutes = Math.round((Date.now() - new Date(s.punchIn).getTime()) / 60000);
      return {
        sessionId: s._id,
        user: s.user,
        punchIn: s.punchIn,
        elapsedMinutes,
        elapsedHours: parseFloat((elapsedMinutes / 60).toFixed(2)),
        location: s.location,
      };
    });

    res.json({
      success: true,
      clockedInCount: clockedInList.length,
      clockedInList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
