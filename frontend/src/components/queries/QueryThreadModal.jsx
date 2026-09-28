import React, { useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { X, Send, CheckCircle2, RotateCcw, AlertTriangle, Building2 } from 'lucide-react';

export const QueryThreadModal = ({ query, onClose, onUpdated }) => {
  const { user } = useAuth();
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setLoading(true);
    try {
      await api.replyToQuery(query._id, { message: replyMessage });
      setReplyMessage('');
      if (onUpdated) onUpdated();
    } catch (err) {
      alert(err.message || 'Failed to post reply');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = query.status === 'resolved' ? 'in_review' : 'resolved';
    setStatusLoading(true);
    try {
      await api.updateQueryStatus(query._id, newStatus);
      if (onUpdated) onUpdated();
    } catch (err) {
      alert(err.message || 'Failed to update query status');
    } finally {
      setStatusLoading(false);
    }
  };

  const isResolved = query.status === 'resolved';

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '680px', padding: '1.75rem', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className={`badge ${isResolved ? 'badge-success' : query.status === 'in_review' ? 'badge-warning' : 'badge-danger'}`}>
                {isResolved ? '✓ Resolved' : query.status === 'in_review' ? '⏳ Under Review' : '● Open Ticket'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Category: <strong style={{ color: 'var(--text-secondary)' }}>{query.category}</strong>
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  background: 'rgba(79, 70, 229, 0.08)',
                  color: 'var(--primary-600)',
                }}
              >
                <Building2 size={11} />
                @{user?.companyDomain}
              </span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {query.title}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Raised by <strong style={{ color: 'var(--text-primary)' }}>{query.raisedBy?.name}</strong> • {new Date(query.createdAt).toLocaleString()}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleToggleStatus}
              disabled={statusLoading}
              className={`btn btn-sm ${isResolved ? 'btn-secondary' : 'btn-success'}`}
              style={{ fontSize: '0.75rem' }}
            >
              {isResolved ? (
                <>
                  <RotateCcw size={13} /> Reopen
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} /> Mark Resolved
                </>
              )}
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: 'var(--radius-full)' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Conversation Thread */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minHeight: '220px',
        }}>
          {query.responses?.map((res, index) => {
            const isMe = res.sender?._id === user?._id || res.sender === user?._id;
            return (
              <div
                key={res._id || index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isMe ? '#818cf8' : '#38bdf8' }}>
                    {res.sender?.name || (isMe ? user?.name : 'Colleague')}
                  </span>
                  {res.sender?.role && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      ({res.sender.role})
                    </span>
                  )}
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                    {new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  style={{
                    maxWidth: '80%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    background: isMe ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : '#f1f5f9',
                    border: isMe ? 'none' : '1px solid var(--border-subtle)',
                    color: isMe ? '#ffffff' : 'var(--text-primary)',
                  }}
                >
                  {res.message}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Input Form */}
        <form onSubmit={handleSendReply} style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Write a response or solution..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={loading || !replyMessage.trim()}
              className="btn btn-primary"
              style={{ padding: '0 1.25rem' }}
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
