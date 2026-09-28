import React, { useState } from 'react';
import { api } from '../../api/client';
import { X, CheckCircle, Clock, FileText } from 'lucide-react';

export const TaskProgressModal = ({ task, onClose, onUpdated }) => {
  const [percent, setPercent] = useState(task?.progressPercentage || 0);
  const [note, setNote] = useState('');
  const [hoursAdded, setHoursAdded] = useState('');
  const [status, setStatus] = useState(task?.status || 'in_progress');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateTaskProgress(task._id, {
        percent: Number(percent),
        note: note || `Progress updated to ${percent}%`,
        loggedHoursAdded: hoursAdded ? Number(hoursAdded) : 0,
        status: Number(percent) === 100 ? 'completed' : status,
      });
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPercent = (val) => {
    setPercent(val);
    if (val === 100) setStatus('completed');
    else if (val > 0 && status === 'todo') setStatus('in_progress');
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ padding: '1.75rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#818cf8', fontWeight: 700 }}>
              Task Progress Update
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {task?.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem', borderRadius: 'var(--radius-full)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Progress Percentage & Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Completion Percentage
              </label>
              <span style={{
                fontSize: '1.25rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: Number(percent) === 100 ? '#34d399' : '#818cf8',
              }}>
                {percent}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={percent}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPercent(val);
                if (val === 100) setStatus('completed');
              }}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '8px',
                background: `linear-gradient(to right, #6366f1 ${percent}%, rgba(255,255,255,0.1) ${percent}%)`,
                outline: 'none',
                cursor: 'pointer',
              }}
            />

            {/* Quick Percentage Presets */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              {[25, 50, 75, 100].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleQuickPercent(p)}
                  className={`role-chip ${percent === p ? 'active' : ''}`}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  {p === 100 ? '100% (Done)' : `${p}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Status Override */}
          <div className="form-group">
            <label className="form-label">Workflow Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Log hours worked */}
          <div className="form-group">
            <label className="form-label">Log Dedicated Hours (Optional)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="0.5"
                min="0"
                className="form-input"
                placeholder="e.g. 2.5"
                value={hoursAdded}
                onChange={(e) => setHoursAdded(e.target.value)}
              />
              <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                hours
              </span>
            </div>
          </div>

          {/* Progress Note */}
          <div className="form-group">
            <label className="form-label">Progress Note & Update Log</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g., Completed database index configuration, verified zero latency spikes."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
          </div>

          {/* Progress History Preview */}
          {task?.progressLogs && task.progressLogs.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Previous Progress Activity ({task.progressLogs.length})
              </span>
              <div style={{
                maxHeight: '120px',
                overflowY: 'auto',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem',
                marginTop: '0.4rem',
                fontSize: '0.75rem',
              }}>
                {task.progressLogs.slice().reverse().map((log, idx) => (
                  <div key={idx} style={{ padding: '0.35rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: '#818cf8' }}>{log.percent}%</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>{log.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
