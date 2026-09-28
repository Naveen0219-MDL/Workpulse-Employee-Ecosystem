import React from 'react';
import { Clock, TrendingUp, Calendar, Zap } from 'lucide-react';

export const WeeklyHoursChart = ({ weeklyData, targetHours = 40 }) => {
  const days = weeklyData?.dailyBreakdown || [];
  const totalHours = weeklyData?.totalHours || 0;
  const overtime = weeklyData?.overtimeHours || 0;
  const completionRate = Math.min(100, Math.round((totalHours / targetHours) * 100));

  // Max daily hours for scaling bars (default to 10 for clean ratio)
  const maxBarHours = Math.max(10, ...days.map((d) => d.hours));

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Weekly Work Hours</h4>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            Week Range: {weeklyData?.weekRange?.start} to {weeklyData?.weekRange?.end}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
              {totalHours}h
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              / {targetHours}h
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: completionRate >= 100 ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
            {completionRate}% of target met
          </span>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="progress-bar-container" style={{ height: '6px', marginBottom: '1.75rem' }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${completionRate}%`,
            background: completionRate >= 100
              ? 'linear-gradient(90deg, #10b981, #06b6d4)'
              : 'linear-gradient(90deg, #6366f1, #38bdf8)',
          }}
        />
      </div>

      {/* Day by Day Bar Visualization */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '160px',
        padding: '0 0.5rem 0.5rem 0.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '0.5rem',
      }}>
        {days.map((dayObj) => {
          const heightPercent = maxBarHours > 0 ? (dayObj.hours / maxBarHours) * 100 : 0;
          const isTargetMet = dayObj.hours >= 8;
          const isToday = dayObj.date === new Date().toISOString().split('T')[0];

          return (
            <div
              key={dayObj.day}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                gap: '0.5rem',
              }}
            >
              {/* Hour tooltip above bar */}
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: dayObj.hours > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
              }}>
                {dayObj.hours > 0 ? `${dayObj.hours}h` : '-'}
              </span>

              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '36px',
                  height: `${Math.max(6, heightPercent)}%`,
                  borderRadius: '6px 6px 2px 2px',
                  background: isTargetMet
                    ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)'
                    : dayObj.hours > 0
                    ? 'linear-gradient(180deg, #818cf8 0%, #4f46e5 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  boxShadow: isTargetMet ? '0 0 12px rgba(52, 211, 153, 0.25)' : 'none',
                  transition: 'height 0.4s ease',
                  border: isToday ? '1px solid #38bdf8' : 'none',
                }}
              />

              {/* Day Label */}
              <span style={{
                fontSize: '0.725rem',
                fontWeight: isToday ? 700 : 500,
                color: isToday ? '#38bdf8' : 'var(--text-secondary)',
              }}>
                {dayObj.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#34d399' }} /> 8h+ standard day
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#818cf8', marginLeft: '0.5rem' }} /> Logged hours
        </div>

        {overtime > 0 && (
          <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Zap size={13} /> +{overtime}h Overtime
          </span>
        )}
      </div>
    </div>
  );
};
