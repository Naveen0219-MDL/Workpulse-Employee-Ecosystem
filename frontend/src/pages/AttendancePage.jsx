import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { PunchWidget } from '../components/attendance/PunchWidget';
import { WeeklyHoursChart } from '../components/attendance/WeeklyHoursChart';
import { Clock, Calendar, CheckCircle2, AlertCircle, User, Filter } from 'lucide-react';

export const AttendancePage = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);

  const isManagerOrAdmin = ['admin', 'manager'].includes(user?.role);

  useEffect(() => {
    if (isManagerOrAdmin) {
      api.getUsers('role=employee')
        .then((data) => setEmployees(data.users || []))
        .catch((err) => console.error(err));
    }
  }, [user]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await api.getWeeklyHours(selectedUserId);
      setWeeklyData(data);
    } catch (err) {
      console.error('Failed to load attendance logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedUserId]);

  const sessions = weeklyData?.sessions || [];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Workforce Shifts & Timesheets
          </span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            Attendance & Weekly Hours
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Monitor login/logout timestamps, shift durations, weekly hours targets, and overtime compliance.
          </p>
        </div>

        {/* Manager/Admin Employee Selector Dropdown */}
        {isManagerOrAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <User size={16} color="#818cf8" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Viewing Timesheet:</span>
            <select
              className="form-select"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Myself ({user?.name})</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Top Grid: Punch In/Out Widget & Weekly Work Hours Bar Chart */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <PunchWidget onUpdate={fetchAttendance} />
        <WeeklyHoursChart
          weeklyData={weeklyData}
          targetHours={weeklyData?.targetHours || user?.weeklyTargetHours || 40}
        />
      </div>

      {/* Shift Logs Table */}
      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
              Shift History Log {weeklyData?.employee ? `(${weeklyData.employee.name})` : ''}
            </h4>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Logged login/logout events for the current weekly cycle
            </p>
          </div>

          <span className="badge badge-info">
            {sessions.length} Recorded Shifts
          </span>
        </div>

        {sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            No shift attendance records found for this week. Punch in above to start logging.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Shift Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Login (Punch In)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Logout (Punch Out)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                <th style={{ padding: '0.75rem 1rem' }}>Shift Notes & Location</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice().reverse().map((session) => {
                const isActive = session.status === 'active';
                const durationHrs = (session.durationMinutes / 60).toFixed(2);

                return (
                  <tr
                    key={session._id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: isActive ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                    }}
                  >
                    {/* Date */}
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} color="#94a3b8" />
                        <span>{session.date}</span>
                      </div>
                    </td>

                    {/* Punch In */}
                    <td style={{ padding: '1rem', color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {new Date(session.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    {/* Punch Out */}
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)' }}>
                      {session.punchOut ? (
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {new Date(session.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      ) : (
                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>In Progress</span>
                      )}
                    </td>

                    {/* Duration */}
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {isActive ? 'Tracking...' : `${durationHrs} hrs`}
                      </span>
                      {!isActive && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
                          ({session.durationMinutes}m)
                        </span>
                      )}
                    </td>

                    {/* Notes */}
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      <div>{session.notes || 'Normal work shift'}</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{session.location || 'Office'}</span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <span className={`badge ${isActive ? 'badge-success' : 'badge-info'}`}>
                        {isActive ? '● Active Now' : '✓ Completed'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
