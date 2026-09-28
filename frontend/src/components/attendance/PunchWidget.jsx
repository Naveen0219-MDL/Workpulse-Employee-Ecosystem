import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Clock, Play, Square, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

export const PunchWidget = ({ onUpdate }) => {
  const { todayAttendance, refreshAttendance } = useAuth();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

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

  const handlePunchAction = async () => {
    setLoading(true);
    try {
      if (todayAttendance?.isClockedIn) {
        await api.punchOut({ notes: noteText || 'Standard checkout' });
        setNoteText('');
        setShowNoteInput(false);
      } else {
        await api.punchIn({ notes: noteText || 'Standard checkin' });
        setNoteText('');
      }
      await refreshAttendance();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const isClockedIn = todayAttendance?.isClockedIn;

  return (
    <div className="glass-card" style={{ border: isClockedIn ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: isClockedIn ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isClockedIn ? '#10b981' : '#818cf8',
          }}>
            <Clock size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Attendance & Punch Clock</h4>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        <span className={`badge ${isClockedIn ? 'badge-success' : 'badge-warning'}`}>
          {isClockedIn ? '● Shift Active' : '○ Off Duty'}
        </span>
      </div>

      {/* Main Timer Display */}
      <div style={{
        textAlign: 'center',
        padding: '1.5rem',
        background: '#f8fafc',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '1.25rem',
      }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
          {isClockedIn ? 'Current Session Duration' : "Ready to Start Today's Shift"}
        </span>
        <div style={{
          fontSize: '2.5rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          color: isClockedIn ? '#059669' : 'var(--text-secondary)',
          margin: '0.5rem 0',
          letterSpacing: '0.05em',
          textShadow: isClockedIn ? '0 0 16px rgba(5, 150, 105, 0.2)' : 'none',
        }}>
          {isClockedIn ? formatTimer(elapsedSeconds) : '00:00:00'}
        </div>

        {isClockedIn && todayAttendance?.activeSession?.punchIn && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Punched in at: <strong style={{ color: 'var(--text-primary)' }}>{new Date(todayAttendance.activeSession.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
          </p>
        )}
      </div>

      {/* Optional Note input */}
      {showNoteInput && (
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder={isClockedIn ? 'Add optional punch out note (e.g. Wrapped up sprint task)' : 'Add optional punch in note'}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={handlePunchAction}
          disabled={loading}
          className={`btn ${isClockedIn ? 'btn-danger' : 'btn-success'}`}
          style={{ flex: 1, padding: '0.75rem' }}
        >
          {isClockedIn ? (
            <>
              <Square size={16} fill="currentColor" /> Clock Out (Punch Out)
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" /> Clock In (Punch In)
            </>
          )}
        </button>

        <button
          onClick={() => setShowNoteInput(!showNoteInput)}
          className="btn btn-secondary"
          style={{ padding: '0.75rem 1rem' }}
          title="Add Note"
        >
          {showNoteInput ? 'Cancel' : 'Note'}
        </button>
      </div>

      {/* Today's Logged Hours Counter */}
      <div style={{
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
      }}>
        <span style={{ color: 'var(--text-muted)' }}>Today's Total Hours:</span>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {todayAttendance?.todayHours || 0} hrs ({todayAttendance?.todayMinutes || 0} mins)
        </span>
      </div>
    </div>
  );
};
