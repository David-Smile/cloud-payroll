export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  const data = await response.json();
  return { response, data };
} 