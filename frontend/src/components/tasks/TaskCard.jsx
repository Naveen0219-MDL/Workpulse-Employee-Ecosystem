import React from 'react';
import { Calendar, CheckCircle2, Clock, User, AlertTriangle, ArrowUpRight } from 'lucide-react';

export const TaskCard = ({ task, onOpenProgressModal, onEditTask, canManage = false }) => {
  const isOverdue = task.status !== 'completed' && new Date(task.deadline) < new Date();

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="badge badge-danger">⚡ Urgent</span>;
      case 'high':
        return <span className="badge badge-warning">High</span>;
      case 'medium':
        return <span className="badge badge-info">Medium</span>;
      default:
        return <span className="badge badge-secondary">Low</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">✓ Completed</span>;
      case 'in_progress':
        return <span className="badge badge-info">⏳ In Progress</span>;
      case 'in_review':
        return <span className="badge badge-warning">👀 In Review</span>;
      default:
        return <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>To Do</span>;
    }
  };

  const formatDeadline = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        {/* Header: Priority & Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {getPriorityBadge(task.priority)}
            {getStatusBadge(task.status)}
          </div>
          {isOverdue && (
            <span style={{ fontSize: '0.7rem', color: '#fb7185', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <AlertTriangle size={12} /> Overdue
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
          {task.title}
        </h4>
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.4',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {task.description || 'No description provided.'}
        </p>
      </div>

      <div>
        {/* Progress bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Progress</span>
            <span style={{ fontWeight: 700, color: task.progressPercentage === 100 ? '#34d399' : '#818cf8' }}>
              {task.progressPercentage || 0}%
            </span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{
                width: `${task.progressPercentage || 0}%`,
                background: task.progressPercentage === 100
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : 'linear-gradient(90deg, #6366f1, #06b6d4)',
              }}
            />
          </div>
        </div>

        {/* Assigned Employee & Deadline */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          marginBottom: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <img
              src={task.assignedTo?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
              alt={task.assignedTo?.name}
              style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              {task.assignedTo?.name || 'Unassigned'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isOverdue ? '#fb7185' : 'var(--text-muted)' }}>
            <Calendar size={13} />
            <span>{formatDeadline(task.deadline)}</span>
          </div>
        </div>

        {/* Interactive Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onOpenProgressModal(task)}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, fontSize: '0.75rem' }}
          >
            Update Progress
          </button>

          {canManage && (
            <button
              onClick={() => onEditTask(task)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.6rem' }}
              title="Edit Task Details"
            >
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
