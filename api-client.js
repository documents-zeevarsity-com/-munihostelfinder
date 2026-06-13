(function(global) {
  // Default to localhost:4000 for development if no base URL is provided
  const defaultBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:4000/api' : '/api';
  const API_BASE_URL = global.API_BASE_URL || defaultBase;

  async function request(path, options = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    const token = sessionStorage.getItem('authToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, Object.assign({ headers, credentials: 'same-origin' }, options));
    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error('Unexpected API response format');
      }
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || `API request failed (${response.status})`;
      throw new Error(errorMessage);
    }

    if (data.token) {
      sessionStorage.setItem('authToken', data.token);
    }

    return data;
  }

  const apiClient = {
    register(payload) {
      return request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    },
    login(email, password) {
      return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    },
    me() {
      return request('/auth/me');
    },
    getHostels() {
      return request('/hostels');
    },
    getBookings() {
      return request('/bookings');
    },
    createBooking(payload) {
      return request('/bookings', { method: 'POST', body: JSON.stringify(payload) });
    },
    createHostel(payload) {
      return request('/hostels', { method: 'POST', body: JSON.stringify(payload) });
    },
    getHostel(id) {
      return request(`/hostels/${id}`);
    },
    updateHostel(id, payload) {
      return request(`/hostels/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
    deleteHostel(id) {
      return request(`/hostels/${id}`, { method: 'DELETE' });
    },
    getAllUsers(page = 1, limit = 20) {
      return request(`/users?page=${page}&limit=${limit}`);
    },
    updateUserProfile(payload) {
      return request('/users/me', { method: 'PUT', body: JSON.stringify(payload) });
    },
    changePassword(payload) {
      return request('/auth/password', { method: 'PUT', body: JSON.stringify(payload) });
    },
    updateUserRole(userId, role) {
      return request(`/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
    },
    updateUserStatus(userId, status) {
      return request(`/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    },
    assignHostelToAdmin(userId, hostelId) {
      return request(`/users/${userId}/assign-hostel`, { method: 'PUT', body: JSON.stringify({ hostelId }) });
    },
    getSecurityLogs() {
      return request('/security-logs'); // This endpoint will need to be created
    }
  };

  global.apiClient = apiClient;
})(window);
