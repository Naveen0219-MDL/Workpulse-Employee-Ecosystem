import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { QueryModal } from '../components/queries/QueryModal';
import { QueryThreadModal } from '../components/queries/QueryThreadModal';
import {
  HelpCircle,
  Plus,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Building2,
} from 'lucide-react';

export const QueriesPage = () => {
  const { user } = useAuth();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeQueryThread, setActiveQueryThread] = useState(null);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      let params = [];
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
      if (categoryFilter !== 'all') params.push(`category=${categoryFilter}`);

      const data = await api.getQueries(params.join('&'));
      setQueries(data.queries || []);
    } catch (err) {
      console.error('Failed to load queries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [statusFilter, categoryFilter]);

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

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'task_blocker':
        return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>🛑 Blocker</span>;
      case 'technical':
        return <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc' }}>💻 Tech</span>;
      case 'hr_payroll':
        return <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>💼 HR/Pay</span>;
      default:
        return <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>General</span>;
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Company Helpdesk & Chat
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
                background: 'rgba(6, 182, 212, 0.08)',
                color: '#0891b2',
                border: '1px solid rgba(6, 182, 212, 0.2)',
              }}
            >
              <Building2 size={12} />
              @{user?.companyDomain} only
            </span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Queries, Blockers & Discussions
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Raise questions, technical blockers, and chat in resolution threads strictly within {user?.companyName || user?.companyDomain}.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus size={16} /> Raise New Query
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Queries' },
              { id: 'open', label: 'Open' },
              { id: 'in_review', label: 'In Review' },
              { id: 'resolved', label: 'Resolved' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`role-chip ${statusFilter === s.id ? 'active' : ''}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category:</span>
            <select
              className="form-select"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="task_blocker">Task Blocker</option>
              <option value="technical">Technical Support</option>
              <option value="hr_payroll">HR & Payroll</option>
              <option value="general">General Question</option>
            </select>
          </div>
        </div>
      </div>

      {/* Query Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading query threads...
        </div>
      ) : queries.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No tickets found
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            All queries have either been resolved or none match the selected filters.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ marginTop: '1.25rem' }}
          >
            <Plus size={16} /> Raise New Query
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {queries.map((q) => {
            const isResolved = q.status === 'resolved';
            const responseCount = q.responses?.length || 0;

            return (
              <div
                key={q._id}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  borderLeft: isResolved ? '4px solid #10b981' : q.priority === 'urgent' ? '4px solid #ef4444' : '4px solid #6366f1',
                }}
                onClick={() => setActiveQueryThread(q)}
              >
                <div style={{ flex: 1, minWidth: 0, paddingRight: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    {getCategoryBadge(q.category)}
                    {getPriorityBadge(q.priority)}
                    <span className={`badge ${isResolved ? 'badge-success' : q.status === 'in_review' ? 'badge-warning' : 'badge-danger'}`}>
                      {isResolved ? '✓ Resolved' : q.status === 'in_review' ? '⏳ Under Review' : '● Open'}
                    </span>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      • {new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {q.title}
                  </h4>

                  <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {q.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                  {/* Raised By User */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img
                      src={q.raisedBy?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
                      alt={q.raisedBy?.name}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                        {q.raisedBy?.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {q.raisedBy?.department}
                      </span>
                    </div>
                  </div>

                  {/* Comments Count Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <MessageSquare size={16} color="#818cf8" />
                    <span>{responseCount}</span>
                  </div>

                  {/* Open Thread CTA */}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveQueryThread(q);
                    }}
                  >
                    View Thread
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <QueryModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchQueries}
        />
      )}

      {activeQueryThread && (
        <QueryThreadModal
          query={activeQueryThread}
          onClose={() => setActiveQueryThread(null)}
          onUpdated={() => {
            fetchQueries();
            // Re-fetch the updated query object to keep modal live
            api.getQueries().then((data) => {
              const updated = data.queries?.find((q) => q._id === activeQueryThread._id);
              if (updated) setActiveQueryThread(updated);
            });
          }}
        />
      )}
    </div>
  );
};
