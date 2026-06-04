(function(global) {
  const API_BASE_URL = global.API_BASE_URL || '/api';

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
    getAllUsers() {
      return request('/users');
    }
  };

  global.apiClient = apiClient;
})(window);
