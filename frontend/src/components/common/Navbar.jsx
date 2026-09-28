import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { ProfileModal } from './ProfileModal';
import {
  Clock,
  Play,
  Square,
  LogOut,
  User,
  Shield,
  Briefcase,
  Building2,
  Edit3,
} from 'lucide-react';

export const Navbar = () => {
  const { user, todayAttendance, refreshAttendance, logout } = useAuth();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Live timer for active punch session
  useEffect(() => {
    let interval = null;
    if (todayAttendance?.isClockedIn && todayAttendance?.activeSession?.punchIn) {
      const punchTime = new Date(todayAttendance.activeSession.punchIn).getTime();
      const updateTimer = () => {
        const now = Date.now();
        setElapsedSeconds(Math.max(0, Math.floor((now - punchTime) / 1000)));
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [todayAttendance]);

  const formatTimer = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handlePunchToggle = async () => {
    setActionLoading(true);
    try {
      if (todayAttendance?.isClockedIn) {
        await api.punchOut({ notes: 'Shift completed from navbar' });
      } else {
        await api.punchIn({ notes: 'Punch in from navbar' });
      }
      await refreshAttendance();
    } catch (err) {
      alert(err.message || 'Attendance action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') return <span className="badge badge-admin"><Shield size={12} /> Admin</span>;
    if (role === 'manager') return <span className="badge badge-manager"><Briefcase size={12} /> Manager</span>;
    return <span className="badge badge-employee"><User size={12} /> Employee</span>;
  };

  return (
    <>
      <header style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      }}>
        {/* Main Navbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 2.25rem',
        }}>
          {/* Left: Brand & Company Tenant */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            }}>
              <Clock size={20} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' }}>
                  WorkPulse
                </h1>
                {user?.companyDomain && (
                  <div
                    title={`Isolated Workspace: ${user?.companyName} (@${user?.companyDomain})`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.2rem 0.6rem',
                      background: 'rgba(79, 70, 229, 0.08)',
                      color: 'var(--primary-600)',
                      borderRadius: '16px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      border: '1px solid rgba(79, 70, 229, 0.2)',
                    }}
                  >
                    <Building2 size={13} />
                    <span>{user?.companyName || user?.companyDomain}</span>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                {user?.companyDomain ? `Workspace: @${user.companyDomain}` : 'Workforce Performance Ecosystem'}
              </p>
            </div>
          </div>

          {/* Right: Clock & User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Punch Clock Widget */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem 0.6rem 0.35rem 1rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: todayAttendance?.isClockedIn ? '#059669' : '#94a3b8',
                  boxShadow: todayAttendance?.isClockedIn ? '0 0 8px #059669' : 'none',
                  display: 'inline-block',
                  animation: todayAttendance?.isClockedIn ? 'pulse 2s infinite' : 'none',
                }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    {todayAttendance?.isClockedIn ? 'Session Live' : 'Clocked Out'}
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: todayAttendance?.isClockedIn ? '#059669' : 'var(--text-secondary)',
                  }}>
                    {todayAttendance?.isClockedIn ? formatTimer(elapsedSeconds) : '00:00:00'}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePunchToggle}
                disabled={actionLoading}
                className={`btn btn-sm ${todayAttendance?.isClockedIn ? 'btn-danger' : 'btn-success'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
                title={todayAttendance?.isClockedIn ? 'Click to Punch Out' : 'Click to Punch In'}
              >
                {todayAttendance?.isClockedIn ? (
                  <>
                    <Square size={13} fill="currentColor" /> Punch Out
                  </>
                ) : (
                  <>
                    <Play size={13} fill="currentColor" /> Punch In
                  </>
                )}
              </button>
            </div>

            {/* User Profile Pill with Edit Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                title="Click to edit profile, display picture (DP) & bio"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.3rem 0.65rem',
                  background: 'rgba(241, 245, 249, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={user?.name}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      border: '2px solid #e2e8f0',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      background: 'var(--primary-600)',
                      color: '#fff',
                      borderRadius: '50%',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  >
                    <Edit3 size={9} />
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user?.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary-600)', fontWeight: 600 }}>
                      (Edit)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {getRoleBadge(user?.role)}
                  </div>
                </div>
              </button>

              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                title="Sign Out"
                style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile & Avatar Editing Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
