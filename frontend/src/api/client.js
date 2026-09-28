const BASE_URL = '/api';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('workpulse_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
};

export const api = {
  // Auth
  login: (credentials) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (data) =>
    apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getUsers: (params = '') => apiRequest(`/auth/users${params ? `?${params}` : ''}`),

  // Attendance
  punchIn: (body = {}) =>
    apiRequest('/attendance/punch-in', { method: 'POST', body: JSON.stringify(body) }),
  punchOut: (body = {}) =>
    apiRequest('/attendance/punch-out', { method: 'POST', body: JSON.stringify(body) }),
  getTodayStatus: () => apiRequest('/attendance/today'),
  getWeeklyHours: (userId = '') =>
    apiRequest(`/attendance/weekly${userId ? `?userId=${userId}` : ''}`),
  getLiveRoster: () => apiRequest('/attendance/roster'),

  // Tasks
  getTasks: (params = '') =>
    apiRequest(`/tasks${params ? `?${params}` : ''}`),
  createTask: (data) =>
    apiRequest('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTaskProgress: (id, data) =>
    apiRequest(`/tasks/${id}/progress`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateTask: (id, data) =>
    apiRequest(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id) =>
    apiRequest(`/tasks/${id}`, { method: 'DELETE' }),

  // Queries
  getQueries: (params = '') =>
    apiRequest(`/queries${params ? `?${params}` : ''}`),
  createQuery: (data) =>
    apiRequest('/queries', { method: 'POST', body: JSON.stringify(data) }),
  replyToQuery: (id, data) =>
    apiRequest(`/queries/${id}/reply`, { method: 'POST', body: JSON.stringify(data) }),
  updateQueryStatus: (id, status) =>
    apiRequest(`/queries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Analytics & Performance
  getPerformance: (employeeId = '') =>
    apiRequest(`/analytics/performance${employeeId ? `/${employeeId}` : ''}`),
  getTeamOverview: (department = '') =>
    apiRequest(`/analytics/team${department ? `?department=${department}` : ''}`),
  getDashboardSummary: () =>
    apiRequest('/analytics/summary'),
};
