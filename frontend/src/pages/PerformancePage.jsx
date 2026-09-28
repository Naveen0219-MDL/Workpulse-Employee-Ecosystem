import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { StatCard } from '../components/common/StatCard';
import { PerformanceGauge } from '../components/analytics/PerformanceGauge';
import { LeaderboardTable } from '../components/analytics/LeaderboardTable';
import { Award, Zap, Users, CheckCircle2, TrendingUp, Sparkles, Filter } from 'lucide-react';

export const PerformancePage = () => {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [inspectedPerformance, setInspectedPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const isManagerOrAdmin = ['admin', 'manager'].includes(user?.role);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      if (isManagerOrAdmin) {
        const query = departmentFilter !== 'all' ? departmentFilter : '';
        const data = await api.getTeamOverview(query);
        setTeamData(data);

        // If an employee is selected, fetch their specific deep scorecard, otherwise default to top employee
        const targetId = selectedEmployeeId || (data.leaderboard?.[0]?.id);
        if (targetId) {
          setSelectedEmployeeId(targetId);
          const empPerf = await api.getPerformance(targetId);
          setInspectedPerformance(empPerf);
        }
      } else {
        const empPerf = await api.getPerformance();
        setInspectedPerformance(empPerf);
      }
    } catch (err) {
      console.error('Failed to load performance scorecard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [departmentFilter]);

  const handleSelectEmployee = async (empId) => {
    setSelectedEmployeeId(empId);
    try {
      const empPerf = await api.getPerformance(empId);
      setInspectedPerformance(empPerf);
    } catch (err) {
      console.error('Failed to load employee performance', err);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Workforce Evaluation & Analytics
          </span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            {isManagerOrAdmin ? 'Workforce Performance Scorecard' : 'My Performance & KPIs'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Transparent 0–100 performance scoring based on task delivery velocity (45%), weekly work hours compliance (35%), and blocker resolution (20%).
          </p>
        </div>

        {/* Department Filter (For Manager / Admin) */}
        {isManagerOrAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Department:</span>
            <select
              className="form-select"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', width: 'auto' }}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Cloud Infrastructure">Cloud Infrastructure</option>
              <option value="Quality Assurance">Quality Assurance</option>
            </select>
          </div>
        )}
      </div>

      {/* Top Aggregated KPI Cards for Managers/Admins */}
      {isManagerOrAdmin && teamData && (
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="Workforce Average Score"
            value={`${teamData.averageScore} / 100`}
            subtitle="Weighted performance index"
            icon={Award}
            color="#8b5cf6"
            badge="Org Average"
          />
          <StatCard
            title="Total Team Hours Worked"
            value={`${teamData.totalHoursWorked}h`}
            subtitle="Accumulated weekly work shifts"
            icon={Zap}
            color="#38bdf8"
          />
          <StatCard
            title="Active Workforce Evaluated"
            value={`${teamData.count} Members`}
            subtitle="Benchmarked against 40h target"
            icon={Users}
            color="#10b981"
          />
        </div>
      )}

      {/* Deep-Dive Performance Inspector Gauge */}
      {inspectedPerformance && (
        <div style={{ marginBottom: '2rem' }}>
          <PerformanceGauge
            performance={inspectedPerformance.performance}
            employeeName={inspectedPerformance.employee?.name || user?.name}
          />
        </div>
      )}

      {/* Leaderboard Table (Visible to Admin & Manager) */}
      {isManagerOrAdmin && teamData && (
        <LeaderboardTable
          leaderboard={teamData.leaderboard || []}
          onSelectEmployee={handleSelectEmployee}
          selectedEmployeeId={selectedEmployeeId}
        />
      )}

      {/* Employee Insight & Tips (For Employee view) */}
      {!isManagerOrAdmin && (
        <div className="glass-card" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={18} color="#f59e0b" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>How to Optimize Your Performance Score</h4>
          </div>
          <div className="grid-3" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: '#818cf8', display: 'block', marginBottom: '0.25rem' }}>1. Maintain Task Velocity (45%)</strong>
              Consistently update your task completion slider and deliver before the set deadline to earn on-time completion bonuses.
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '0.25rem' }}>2. Meet Weekly Target Hours (35%)</strong>
              Punch in promptly at shift start and punch out at completion to hit your 40h weekly target without unlogged sessions.
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: '#34d399', display: 'block', marginBottom: '0.25rem' }}>3. Proactive Blocker Resolution (20%)</strong>
              Raise questions or blockers early in the Query Center and collaborate with your manager until marked resolved.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
