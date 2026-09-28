import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { StatCard } from '../components/common/StatCard';
import { WeeklyHoursChart } from '../components/attendance/WeeklyHoursChart';
import { PerformanceGauge } from '../components/analytics/PerformanceGauge';
import {
  Users,
  CheckSquare,
  Clock,
  HelpCircle,
  Award,
  Zap,
  ArrowRight,
  Building2,
  Calendar,
  AlertCircle,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const DashboardPage = ({ setActiveTab }) => {
  const { user, todayAttendance } = useAuth();
  const [weeklyData, setWeeklyData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [queries, setQueries] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [liveRoster, setLiveRoster] = useState([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState([]);
  const [companyMembers, setCompanyMembers] = useState([]);
  const [myPerformance, setMyPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  const isManagerOrAdmin = ['admin', 'manager'].includes(user?.role);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [weeklyRes, tasksRes, queriesRes, usersRes] = await Promise.all([
        api.getWeeklyHours(),
        api.getTasks(),
        api.getQueries(),
        api.getUsers(),
      ]);

      setWeeklyData(weeklyRes);
      setTasks(tasksRes.tasks || []);
      setQueries(queriesRes.queries || []);
      setCompanyMembers(usersRes.users || []);

      if (isManagerOrAdmin) {
        const [summaryRes, rosterRes, teamRes] = await Promise.all([
          api.getDashboardSummary(),
          api.getLiveRoster(),
          api.getTeamOverview(),
        ]);
        setSummaryStats(summaryRes.stats);
        setLiveRoster(rosterRes.clockedInList || []);
        setTeamLeaderboard(teamRes.leaderboard || []);
      } else {
        const [perfRes, rosterRes] = await Promise.all([
          api.getPerformance(),
          api.getLiveRoster(),
        ]);
        setMyPerformance(perfRes.performance);
        setLiveRoster(rosterRes.clockedInList || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const openQueries = queries.filter((q) => q.status !== 'resolved');

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'urgent':
        return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', label: '⚡ Urgent' };
      case 'high':
        return { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'High' };
      case 'medium':
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'Medium' };
      default:
        return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', label: 'Low' };
    }
  };

  return (
    <div className="page-wrapper">
      {/* Top Welcome Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Workforce Command Center
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.15rem 0.55rem',
                borderRadius: '12px',
                background: 'rgba(79, 70, 229, 0.08)',
                color: '#4f46e5',
                border: '1px solid rgba(79, 70, 229, 0.18)',
              }}
            >
              <Building2 size={12} />
              @{user?.companyDomain}
            </span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing performance metrics, active tasks, and attendance for <strong>{user?.companyName || user?.companyDomain}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('tasks')}
            className="btn btn-primary"
          >
            <CheckSquare size={16} /> Open Tasks Board
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className="btn btn-secondary"
          >
            <Clock size={16} /> Full Timesheets
          </button>
        </div>
      </div>

      {/* Top Stat Cards Row */}
      {isManagerOrAdmin ? (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="Clocked In Right Now"
            value={summaryStats?.clockedInCount || liveRoster.length}
            subtitle={`${companyMembers.length} colleagues in company`}
            icon={Clock}
            color="#10b981"
            badge="Live"
          />
          <StatCard
            title="Active Company Tasks"
            value={summaryStats?.tasksInProgress || activeTasks.length}
            subtitle={`${summaryStats?.tasksCompleted || 0} tasks completed`}
            icon={CheckSquare}
            color="#6366f1"
          />
          <StatCard
            title="Company Blockers"
            value={summaryStats?.queriesOpen || openQueries.length}
            subtitle="Tickets awaiting resolution"
            icon={HelpCircle}
            color="#f59e0b"
            badge={openQueries.length > 0 ? 'Action Req' : 'Clear'}
          />
          <StatCard
            title="Total Weekly Hours"
            value={`${summaryStats?.weeklyTotalHours || 0}h`}
            subtitle="Company-wide logged work"
            icon={Zap}
            color="#06b6d4"
          />
        </div>
      ) : (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="Today's Logged Hours"
            value={`${todayAttendance?.todayHours || 0}h`}
            subtitle={todayAttendance?.isClockedIn ? 'Shift in progress' : 'Clocked out'}
            icon={Clock}
            color="#10b981"
            badge={todayAttendance?.isClockedIn ? 'Active' : 'Off'}
          />
          <StatCard
            title="Hours This Week"
            value={`${weeklyData?.totalHours || 0}h`}
            subtitle={`Target: ${weeklyData?.targetHours || 40}h`}
            icon={Zap}
            color="#38bdf8"
            badge={`${weeklyData?.completionRate || 0}%`}
          />
          <StatCard
            title="My Pending Tasks"
            value={activeTasks.length}
            subtitle={`${tasks.length - activeTasks.length} completed`}
            icon={CheckSquare}
            color="#818cf8"
          />
          <StatCard
            title="Performance Score"
            value={`${myPerformance?.score || 85}`}
            subtitle={myPerformance?.tier || 'Steady Contributor'}
            icon={Award}
            color={myPerformance?.badgeColor || '#a855f7'}
            badge="KPI"
          />
        </div>
      )}

      {/* Main Grid: Company Workspace & Shift Status (Replacing duplicate PunchWidget) vs Weekly Hours Chart */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Company Workspace & Live Status Overview */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                }}>
                  <Building2 size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {user?.companyName || user?.companyDomain}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Domain Tenant: <strong>@{user?.companyDomain}</strong>
                  </span>
                </div>
              </div>
              <span className="badge badge-primary">
                <Users size={12} /> {companyMembers.length} Colleagues
              </span>
            </div>

            {/* Current User Shift Status Box */}
            <div style={{
              padding: '1.1rem',
              borderRadius: 'var(--radius-md)',
              background: todayAttendance?.isClockedIn ? 'rgba(16, 185, 129, 0.08)' : '#f8fafc',
              border: `1px solid ${todayAttendance?.isClockedIn ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: todayAttendance?.isClockedIn ? '#10b981' : '#94a3b8',
                  boxShadow: todayAttendance?.isClockedIn ? '0 0 10px #10b981' : 'none',
                  animation: todayAttendance?.isClockedIn ? 'pulse 2s infinite' : 'none',
                }} />
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                    {todayAttendance?.isClockedIn ? 'Your Shift is Active' : 'You are Clocked Out'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {todayAttendance?.isClockedIn
                      ? `Logged ${todayAttendance?.todayHours || 0}h today. Use quick punch in the top navbar anytime.`
                      : 'Punch in from the top navbar or visit the attendance page.'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('attendance')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Detailed Timesheet <ArrowRight size={13} />
              </button>
            </div>

            {/* Colleagues Online on Shift */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  Colleagues on Shift Right Now ({liveRoster.length})
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Same company domain only
                </span>
              </div>

              {liveRoster.length === 0 ? (
                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px dashed var(--border-subtle)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    No other colleagues are clocked in at this moment.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {liveRoster.slice(0, 6).map((rosterItem) => (
                    <div
                      key={rosterItem.sessionId || rosterItem._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.35rem 0.65rem',
                        background: '#f1f5f9',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                      }}
                      title={`${rosterItem.user?.name} (${rosterItem.user?.department}) - ${rosterItem.elapsedHours}h on shift`}
                    >
                      <img
                        src={rosterItem.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
                        alt={rosterItem.user?.name}
                        style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {rosterItem.user?.name?.split(' ')[0]}
                      </span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>
                        {rosterItem.elapsedHours}h
                      </span>
                    </div>
                  ))}
                  {liveRoster.length > 6 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center', padding: '0 0.5rem' }}>
                      +{liveRoster.length - 6} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              🔒 Multi-tenant secure workspace
            </span>
            <button
              onClick={() => setActiveTab('queries')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              <HelpCircle size={13} /> Internal Helpdesk
            </button>
          </div>
        </div>

        {/* Weekly Hours Bar Visualizer */}
        <WeeklyHoursChart
          weeklyData={weeklyData}
          targetHours={user?.weeklyTargetHours || 40}
        />
      </div>

      {/* Section 2: Priority Tasks Queue (Clean Dashboard View leading to Tasks Page) */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isManagerOrAdmin ? 'Company Priority Deliverables' : 'My Active Tasks & Milestones'}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              High-priority work items scheduled for delivery
            </p>
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="btn btn-secondary btn-sm"
          >
            View Full Task Board ({tasks.length}) <ArrowRight size={14} />
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <CheckSquare size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No active tasks found for your company.</p>
            {isManagerOrAdmin && (
              <button
                onClick={() => setActiveTab('tasks')}
                className="btn btn-primary btn-sm"
                style={{ marginTop: '1rem' }}
              >
                Allocate Tasks on Board
              </button>
            )}
          </div>
        ) : (
          <div className="grid-3">
            {tasks.slice(0, 3).map((task) => {
              const priorityInfo = getPriorityStyle(task.priority);
              return (
                <div
                  key={task._id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => setActiveTab('tasks')}
                  title="Click to view and update on Tasks Board"
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                          background: priorityInfo.bg,
                          color: priorityInfo.color,
                          border: `1px solid ${priorityInfo.border}`,
                        }}
                      >
                        {priorityInfo.label}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          color: task.status === 'completed' ? '#059669' : '#6366f1',
                        }}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                      {task.title}
                    </h4>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '1rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {task.description}
                    </p>
                  </div>

                  <div>
                    {/* Progress Bar */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                        <span style={{ color: '#0f172a', fontWeight: 800 }}>{task.progressPercentage}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${task.progressPercentage}%`,
                            height: '100%',
                            background: task.progressPercentage === 100 ? '#10b981' : 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.6rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <img
                          src={task.assignee?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
                          alt={task.assignee?.name}
                          style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {task.assignee?.name?.split(' ')[0] || 'Unassigned'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Calendar size={11} /> {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Live Roster & Performance Overview for Manager / Personal Score for Employee */}
      {isManagerOrAdmin ? (
        <div className="grid-2">
          {/* Live Clocked-In Roster */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Company Shift Attendance</h4>
                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  Colleagues from @{user?.companyDomain} active right now
                </p>
              </div>
              <span className="badge badge-success">
                {liveRoster.length} Active Now
              </span>
            </div>

            {liveRoster.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '1rem 0' }}>
                No employees are currently clocked in.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {liveRoster.map((item) => (
                  <div
                    key={item.sessionId || item._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={item.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
                        alt={item.user?.name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>
                          {item.user?.name}
                        </span>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {item.user?.department} • In at {new Date(item.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669' }}>
                        {item.elapsedHours}h active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Leaderboard Preview */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Top Company Performers</h4>
                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  Workforce delivery & hours score within {user?.companyName || user?.companyDomain}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('performance')}
                className="btn btn-secondary btn-sm"
              >
                View Full Scorecard
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {teamLeaderboard.slice(0, 4).map((emp, index) => (
                <div
                  key={emp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.75rem',
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', width: '20px', color: index === 0 ? '#d97706' : 'var(--text-muted)' }}>
                      #{index + 1}
                    </span>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>
                        {emp.name}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {emp.performance?.metrics?.weeklyHoursLogged}h this week • {emp.performance?.metrics?.tasksCompleted} tasks done
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: '#0f172a',
                      background: '#ffffff',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {emp.performance?.score} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Employee: Personal Performance Gauge Preview */
        <PerformanceGauge performance={myPerformance} employeeName={user?.name} />
      )}
    </div>
  );
};
