import React, { useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { X, HelpCircle, AlertCircle, Building2 } from 'lucide-react';

export const QueryModal = ({ onClose, onCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('task_blocker');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Please provide query title and detailed description');
      return;
    }

    setLoading(true);
    try {
      await api.createQuery({
        title,
        description,
        category,
        priority,
      });
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to submit query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#06b6d4', fontWeight: 700 }}>
                Company Helpdesk
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  background: 'rgba(6, 182, 212, 0.08)',
                  color: '#0891b2',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                }}
              >
                <Building2 size={11} />
                @{user?.companyDomain}
              </span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Raise Query or Blocker
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: 'var(--radius-full)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Company Isolation Info Banner */}
        <div style={{
          padding: '0.65rem 0.85rem',
          background: '#f0fdfa',
          border: '1px solid #ccfbf1',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: '#0f766e',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Building2 size={15} />
          <span>This ticket and its chat replies are private to colleagues and managers in <strong>@{user?.companyDomain}</strong>.</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Query Subject / Blocker Summary</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Blocked on staging Redis cluster credentials"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="task_blocker">Task Blocker</option>
                <option value="technical">Technical Support</option>
                <option value="hr_payroll">HR & Payroll</option>
                <option value="general">General Question</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">⚡ Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Explanation & Reproduction</label>
            <textarea
              className="form-textarea"
              rows="4"
              placeholder="Explain what is causing the blocker, steps taken, and what assistance you need from your manager or admin..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Submitting...' : 'Submit Query'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
