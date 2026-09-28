import React from 'react';
import { Award, Zap, CheckCircle2, Clock, HelpCircle, Star } from 'lucide-react';

export const PerformanceGauge = ({ performance, employeeName = 'Employee' }) => {
  if (!performance) return null;

  const score = performance.score || 0;
  const breakdown = performance.breakdown || {};
  const metrics = performance.metrics || {};
  const tier = performance.tier || 'Steady Contributor';
  const badgeColor = performance.badgeColor || '#3b82f6';

  // SVG circular gauge math
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Performance & KPI Scorecard</h4>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            Calculated score for {employeeName}
          </p>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: `${badgeColor}20`,
            color: badgeColor,
            border: `1px solid ${badgeColor}40`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Star size={13} fill="currentColor" /> {tier}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', padding: '1rem 0' }}>
        {/* Circular SVG Gauge */}
        <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Score Bar */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={badgeColor}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.8s ease-in-out',
                filter: `drop-shadow(0 0 10px ${badgeColor}66)`,
              }}
            />
          </svg>

          {/* Center Text */}
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {score}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginTop: '-0.25rem' }}>
              / 100 PTS
            </span>
          </div>
        </div>

        {/* 3 Weighted Components Breakdown */}
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* 1. Tasks Velocity (45% weight) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={14} color="#818cf8" /> Task Velocity & Delivery (45%)
              </span>
              <strong style={{ color: '#0f172a', fontWeight: 800 }}>{breakdown.taskScore || 0} <span style={{ color: '#64748b', fontWeight: 500 }}>/ 100</span></strong>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${breakdown.taskScore || 0}%`, background: '#818cf8' }} />
            </div>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
              {metrics.tasksCompleted || 0} completed • {metrics.tasksInProgress || 0} active • {metrics.averageTaskProgress || 0}% avg progress
            </span>
          </div>

          {/* 2. Hours Compliance (35% weight) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} color="#38bdf8" /> Weekly Hours Target (35%)
              </span>
              <strong style={{ color: '#0f172a', fontWeight: 800 }}>{breakdown.hoursScore || 0} <span style={{ color: '#64748b', fontWeight: 500 }}>/ 100</span></strong>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${breakdown.hoursScore || 0}%`, background: '#38bdf8' }} />
            </div>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
              {metrics.weeklyHoursLogged || 0}h logged of {metrics.weeklyHoursTarget || 40}h weekly goal
            </span>
          </div>

          {/* 3. Communication & Resolution (20% weight) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <HelpCircle size={14} color="#34d399" /> Blocker Resolution (20%)
              </span>
              <strong style={{ color: '#0f172a', fontWeight: 800 }}>{breakdown.queryScore || 0} <span style={{ color: '#64748b', fontWeight: 500 }}>/ 100</span></strong>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${breakdown.queryScore || 0}%`, background: '#34d399' }} />
            </div>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
              {metrics.queriesResolved || 0} resolved of {metrics.queriesTotal || 0} tickets
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
