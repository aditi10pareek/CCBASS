const API_BASE_URL = 'http://localhost:5000/api';

// Helper to make requests
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('nyaayflow_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Server returned unexpected response (${response.status} ${response.statusText})`);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new Error('Unable to connect to backend server. Please verify backend is running on port 5000.');
    }
    throw err;
  }
};

const api = {
  // Authentication
  auth: {
    login: (email, password) => 
      request('/auth/login', { method: 'POST', body: { email, password } }),
    register: (userData) => 
      request('/auth/register', { method: 'POST', body: userData }),
    getProfile: () => 
      request('/auth/profile'),
    getUsers: () => 
      request('/auth/users'),
    updateUserStatus: (id, status) => 
      request(`/auth/users/${id}/status`, { method: 'PUT', body: { status } })
  },

  // Cases
  cases: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/cases?${query}`);
    },
    getById: (id) => 
      request(`/cases/${id}`),
    create: (caseData) => 
      request('/cases', { method: 'POST', body: caseData }),
    update: (id, caseData) => 
      request(`/cases/${id}`, { method: 'PUT', body: caseData }),
    delete: (id) => 
      request(`/cases/${id}`, { method: 'DELETE' })
  },

  // Hearings
  hearings: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/hearings?${query}`);
    },
    schedule: (hearingData) => 
      request('/hearings', { method: 'POST', body: hearingData }),
    update: (id, hearingData) => 
      request(`/hearings/${id}`, { method: 'PUT', body: hearingData })
  },

  // Adjournments
  adjournments: {
    request: (adjournmentData) => 
      request('/adjournments', { method: 'POST', body: adjournmentData }),
    getAll: () => 
      request('/adjournments'),
    updateStatus: (id, status) => 
      request(`/adjournments/${id}`, { method: 'PUT', body: { status } })
  },

  // Lawyers
  lawyers: {
    getAll: () => 
      request('/lawyers'),
    getJudges: () => 
      request('/lawyers/judges'),
    updateAvailability: (availabilityData) => 
      request('/lawyers/availability', { method: 'PUT', body: availabilityData }),
    getMyAvailability: () => 
      request('/lawyers/availability')
  },

  // Analytics / Dashboard
  analytics: {
    getDashboard: () => 
      request('/analytics/dashboard'),
    getCharts: () => 
      request('/analytics/charts'),
    getNotifications: () => 
      request('/analytics/notifications'),
    markNotificationRead: (id) => 
      request(`/analytics/notifications/${id}/read`, { method: 'PUT' })
  }
};

export default api;
