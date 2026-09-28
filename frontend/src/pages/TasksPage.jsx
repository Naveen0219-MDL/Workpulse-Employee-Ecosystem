import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskProgressModal } from '../components/tasks/TaskProgressModal';
import { TaskModal } from '../components/tasks/TaskModal';
import { Plus, Search, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskForProgress, setSelectedTaskForProgress] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const isManagerOrAdmin = ['admin', 'manager'].includes(user?.role);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let queryParams = [];
      if (statusFilter !== 'all') queryParams.push(`status=${statusFilter}`);
      if (searchQuery.trim()) queryParams.push(`search=${encodeURIComponent(searchQuery)}`);

      const data = await api.getTasks(queryParams.join('&'));
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    in_review: tasks.filter((t) => t.status === 'in_review').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Workforce Execution
          </span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            Task Allocation & Progress
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Track project deliverables, milestones, interactive percentage progress, and completion logs.
          </p>
        </div>

        {isManagerOrAdmin && (
          <button
            onClick={() => {
              setTaskToEdit(null);
              setShowTaskModal(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} /> Allocate New Task
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Status Filter Chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'todo', label: 'To Do' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'in_review', label: 'In Review' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`role-chip ${statusFilter === tab.id ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <span>{tab.label}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>({counts[tab.id] || 0})</span>
              </button>
            ))}
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', minWidth: '260px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.5rem 0.75rem 0.5rem 2.25rem', fontSize: '0.825rem' }}
              />
              <Search
                size={14}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Task Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading tasks & progress data...
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <CheckCircle2 size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No tasks found
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            There are no tasks matching the selected filter or search criteria.
          </p>
          {isManagerOrAdmin && (
            <button
              onClick={() => {
                setTaskToEdit(null);
                setShowTaskModal(true);
              }}
              className="btn btn-primary"
              style={{ marginTop: '1.25rem' }}
            >
              <Plus size={16} /> Allocate First Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid-3">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onOpenProgressModal={(t) => setSelectedTaskForProgress(t)}
              onEditTask={(t) => {
                setTaskToEdit(t);
                setShowTaskModal(true);
              }}
              canManage={isManagerOrAdmin}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedTaskForProgress && (
        <TaskProgressModal
          task={selectedTaskForProgress}
          onClose={() => setSelectedTaskForProgress(null)}
          onUpdated={fetchTasks}
        />
      )}

      {showTaskModal && (
        <TaskModal
          task={taskToEdit}
          onClose={() => {
            setShowTaskModal(false);
            setTaskToEdit(null);
          }}
          onSaved={fetchTasks}
        />
      )}
    </div>
  );
};
