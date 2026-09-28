import React from 'react';
import { Award, Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

export const LeaderboardTable = ({ leaderboard = [], onSelectEmployee, selectedEmployeeId }) => {
  const getRankBadge = (index) => {
    if (index === 0) return <span style={{ fontSize: '1.2rem' }}>🥇</span>;
    if (index === 1) return <span style={{ fontSize: '1.2rem' }}>🥈</span>;
    if (index === 2) return <span style={{ fontSize: '1.2rem' }}>🥉</span>;
    return <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>#{index + 1}</span>;
  };

  return (
    <div className="glass-card" style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Workforce Performance Leaderboard</h4>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            Ranked by weighted delivery velocity, weekly hours compliance, and blocker resolution
          </p>
        </div>
        <span className="badge badge-info">{leaderboard.length} Active Employees</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <th style={{ padding: '0.75rem 1rem' }}>Rank</th>
            <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
            <th style={{ padding: '0.75rem 1rem' }}>Department</th>
            <th style={{ padding: '0.75rem 1rem' }}>Hours This Week</th>
            <th style={{ padding: '0.75rem 1rem' }}>Task Completion</th>
            <th style={{ padding: '0.75rem 1rem' }}>Performance Score</th>
            <th style={{ padding: '0.75rem 1rem' }}>Status Tier</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((emp, index) => {
            const isSelected = selectedEmployeeId === emp.id;
            const perf = emp.performance || {};
            const metrics = perf.metrics || {};
            const score = perf.score || 0;
            const badgeColor = perf.badgeColor || '#3b82f6';

            return (
              <tr
                key={emp.id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onClick={() => onSelectEmployee && onSelectEmployee(emp.id)}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Rank */}
                <td style={{ padding: '1rem', width: '50px', textAlign: 'center' }}>
                  {getRankBadge(index)}
                </td>

                {/* Employee Name & Avatar */}
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'}
                      alt={emp.name}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                        {emp.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {emp.designation}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Department */}
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                  {emp.department}
                </td>

                {/* Hours This Week */}
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>
                      {metrics.weeklyHoursLogged || 0}h
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      / {metrics.weeklyHoursTarget || 40}h
                    </span>
                  </div>
                  <div className="progress-bar-container" style={{ height: '4px', width: '100px', marginTop: '0.35rem' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, ((metrics.weeklyHoursLogged || 0) / (metrics.weeklyHoursTarget || 40)) * 100)}%`,
                        background: metrics.weeklyHoursLogged >= 40 ? '#10b981' : '#6366f1',
                      }}
                    />
                  </div>
                </td>

                {/* Task Completion */}
                <td style={{ padding: '1rem' }}>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>
                    {metrics.tasksCompleted || 0} / {metrics.tasksTotal || 0} done
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                    {metrics.averageTaskProgress || 0}% avg progress
                  </span>
                </td>

                {/* Score */}
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{
                      fontSize: '1.25rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: '#0f172a',
                    }}>
                      {score}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
                  </div>
                </td>

                {/* Tier Badge */}
                <td style={{ padding: '1rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      background: `${badgeColor}18`,
                      color: badgeColor,
                      border: `1px solid ${badgeColor}33`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {perf.tier || 'Steady'}
                  </span>
                </td>

                {/* Action button */}
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.35rem 0.65rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectEmployee) onSelectEmployee(emp.id);
                    }}
                  >
                    View Scorecard <ChevronRight size={13} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
