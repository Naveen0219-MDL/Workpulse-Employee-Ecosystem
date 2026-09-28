import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { X, Calendar, User, Clock, AlertCircle } from 'lucide-react';

export const TaskModal = ({ task, onClose, onSaved }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo?._id || task?.assignedTo || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours || 8);
  const [deadline, setDeadline] = useState(
    task?.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''
  );
  const [status, setStatus] = useState(task?.status || 'todo');

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await api.getUsers('role=employee');
        setEmployees(data.users || []);
        if (!assignedTo && data.users?.length > 0) {
          setAssignedTo(data.users[0]._id);
        }
      } catch (err) {
        console.error('Failed to load employee list', err);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !assignedTo || !deadline) {
      alert('Please fill in title, assigned employee, and deadline date');
      return;
    }

    setLoading(true);
    try {
      if (task?._id) {
        await api.updateTask(task._id, {
          title,
          description,
          assignedTo,
          priority,
          estimatedHours: Number(estimatedHours),
          deadline,
          status,
        });
      } else {
        await api.createTask({
          title,
          description,
          assignedTo,
          priority,
          estimatedHours: Number(estimatedHours),
          deadline,
        });
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#818cf8', fontWeight: 700 }}>
              Task Allocation
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {task?._id ? 'Edit Task Details' : 'Allocate New Task'}
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: 'var(--radius-full)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Implement OAuth 2.0 and SAML Authentication"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Task Description</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Provide clear technical requirements, deliverables, and acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Assign To Employee</label>
              <select
                className="form-select"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
              >
                <option value="">Select Employee...</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.department} - {emp.designation})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">⚡ Urgent Priority</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Estimated Hours</label>
              <input
                type="number"
                min="1"
                step="1"
                className="form-input"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deadline Date</label>
              <input
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          {task?._id && (
            <div className="form-group">
              <label className="form-label">Status</label>
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
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : task?._id ? 'Save Changes' : 'Allocate Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
