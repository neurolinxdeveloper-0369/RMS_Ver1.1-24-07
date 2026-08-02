export const API_BASE_URL = import.meta.env.PROD ? 'http://129.121.120.144:8085' : '';

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_BASE_URL + url, {
    ...options,
    headers,
  });
  
  if (response.status === 401 || response.status === 403) {
    // Optionally redirect to login if unauthorized
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  return response;
};
